'use strict';
const { get } = require('axios')
class Handler {

  constructor({ rekoService, translateService }) {
    this.rekoService = rekoService
    this.translateService = translateService
  }

  formatTextResults(texts, workingItems) {
    const finalText = []
    for (const indexText in texts) {
      const nameInPortuguese = texts[indexText]
      const confidence = workingItems[indexText].Confidence
      finalText.push(`${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`)
    }
    return finalText.join('\n')
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }
    const { TranslatedText } = await this.translateService.translateText(params)
      .promise()

    return TranslatedText.split(' e ')
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoService.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence > 90)

    const names = workingItems
      .map(({ Name }) => Name)
      .join(' and ')

    return { names, workingItems }
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'base64')
    return buffer
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters
      console.log('Downloading image...')
      const buffer = await this.getImageBuffer(imageUrl)
      console.log('Detecting labels...')
      const { names, workingItems } = await this.detectImageLabels(buffer)
      console.log('Translating to Portuguese...')
      const texts = await this.translateText(names)
      console.log('Handling final object...')
      const finalText = this.formatTextResults(texts, workingItems)
      console.log('Finishing...')
      return {
        status: 200,
        data: `A imagem tem\n`.concat(finalText)
      }
    } catch (error) {
      console.log('Error***', error.stack)
      return {
        status: 500,
        body: 'Internal server error!'
      }
    }
  }
}

// Factory
const aws = require('aws-sdk')
const reko = new aws.Rekognition()
const translator = new aws.Translate()
const handler = new Handler({
  rekoService: reko,
  translateService: translator
})

module.exports.main = handler.main.bind(handler)