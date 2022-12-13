# projeto19-drivenpass-back-end
API de um gerenciador de senha DrivenPass

## Descricao detalhada
- Usuários
    
    A aplicação deve fornecer uma forma das pessoas criarem contas e utiliza-las.
    
    - Criação de contas
        - O usuário deve fornecer um e-mail válido e uma senha para poder criar um usuário. Se o e-mail já estiver em uso, a aplicação não pode criar a conta. A senha precisa ter um mínimo de 10 caracteres. Por ser um dado extremamente sensível, a senha precisa ir para o banco criptografada. Utilize a biblioteca [bcrypt](https://www.npmjs.com/package/bcrypt) para isso.
    - Acesso de uma conta
        - O usuário deverá utilizar o e-mail e senha cadastrados. Caso ele forneça dados incompatíveis, a aplicação deverá avisá-lo. Ao finalizar o login, ele deverá receber um token baseado na estratégia JWT. Utilize a biblioteca [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) para isso.
        - **Esse token deverá ser enviado em todas as requisições para identificar o usuário.**
- Credenciais
    
    Credenciais se referem a informações de login para um site e/ou serviço.
    
    - Criação de credenciais
        - Para registrar uma nova credencial, o usuário deverá fornecer uma url, um nome de usuário e uma senha. O usuário também precisa informar um título/nome/rótulo para essa credencial, uma vez que é possível cadastrar duas credenciais para um mesmo site.
        - Cada credencial deve possuir um título/nome/rótulo único, ou seja, se o usuário tentar criar duas credenciais com o mesmo nome, a aplicação deve impedi-lo (o que não impede que outras pessoas usem esse título).
        - Por ser um dado sensível, o campo de senha da credencial deve ser criptografado usando um segredo da aplicação. Use a biblioteca [cryptr](https://www.npmjs.com/package/cryptr) para isso.
    - Busca de credenciais
        - A aplicação deve fornecer uma forma de obter todas as credenciais ou uma credencial específica (através do seu id). Se o usuário procurar por uma credencial que não é dele ou que não existe, a aplicação deve avisar.
        - Todas as credenciais retornadas devem aparecer com a senha descriptografada.
    - Deleção de credenciais
        - Aplicação deve permitir que uma credencial seja deletada (dado o seu id). Se o id não existir ou pertencer a credencial de outra pessoa, a aplicação deve avisar.
- Wi-fi
    
    Wi-fi’s representam os dados de acesso a uma rede de internet.
    
    - Criação de Wi-fi
        - Para registrar um novo wifi, o usuário deverá fornecer o nome da rede e senha da rede.
        - Para diferenciar as redes entre si, o usuário deverá também informar um título/nome/rótulo para cada uma delas (Ex: Wifi do vizinho). Esse dado pode se repetir.
        - Por ser informação sensível, a senha da rede de internet deve ser criptografada usando um segredo da aplicação. Use a biblioteca [cryptr](https://www.npmjs.com/package/cryptr) para isso.
    - Busca de redes Wi-fi
        - A aplicação deve fornecer uma forma de obter todas as redes wi-fi ou um rede específica (através do seu id). Se o usuário procurar por uma rede wi-fi que não é dele ou que não existe, a aplicação deve avisar.
    - Deleção redes Wi-fi
        - A aplicação deve permitir que uma rede wi-fi seja deletada (dado o seu id). Se o id não existir ou pertencer a rede wi-fi de outra pessoa, a aplicação deve avisar.