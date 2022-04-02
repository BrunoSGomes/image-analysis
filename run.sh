# 1-) Instalar serverless

npm i -g serverless

# 2-) Iniciar serverless

sls

# 3-) Sempre fazer deploy antes de tudo para verificar se o ambiente está ok

sls deploy

# 4-) Invokar lambda function

sls invoke -f hello

# 5-) Invoke local lambda function

sls invoke local -f hello --l

# 6-) Configurar dashboard do serverless framework

sls

# 7-) Ver logs das chamadas

sls logs -f hello --tail