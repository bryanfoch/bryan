React Native Appointment Scheduler

Este é um aplicativo de agendamento de compromissos desenvolvido com React Native. Ele permite que os usuários selecionem uma data a partir de um calendário e adicionem compromissos com hora e descrição.

Funcionalidades
Seleção de data utilizando um calendário interativo.
Formulário para inserção de hora e descrição do compromisso.
Navegação entre telas utilizando React Navigation.
Instalação
Para instalar e executar este aplicativo, siga as instruções abaixo:

Clone o repositório:

bash:
Copy code
git clone https://github.com/bryanfoch/projeto-react-native-
cd seu-repositorio

Instale as dependências:
bash
Copy code
npm install

Execute o aplicativo:
bash
Copy code
npx react-native run-android

Este aplicativo utiliza as seguintes bibliotecas:

react: Biblioteca principal do React.
react-native: Framework para desenvolvimento mobile.
react-native-calendars: Componente de calendário.
@react-navigation/native: Biblioteca para navegação.
@react-navigation/stack: Biblioteca para navegação em pilha.
Estrutura do Projeto
App.js: Ponto de entrada do aplicativo.
HomeScreen.js: Tela inicial contendo o calendário.
FormScreen.js: Tela de formulário para adicionar compromissos.
