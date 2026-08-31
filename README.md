# 📇 Flashcard Pro

Um aplicativo web moderno, polido e de alto desempenho para criação, visualização e estudo com **flashcards interativos em 3D**. Este projeto foi projetado para ser **100% autônomo (standalone)**, funcionando inteiramente no navegador (client-side) sem qualquer necessidade de servidores, bancos de dados ou dependências externas.

---

## ✨ Recursos Principais

*   **Efeito de Giro 3D Suave**: Utiliza animações de física realistas por meio do `motion` para simular o toque e giro das cartas.
*   **Editor Completo**:
    *   Criação de novos decks de flashcards de forma ilimitada.
    *   Suporte a layouts de **Texto Curto** (com título e corpo de texto independentes) ou **Imagem + Texto** (com título, subtítulo explicativo e imagem associada).
    *   Personalização estética avançada (cores de fundo, cor de texto e orientação).
*   **Exportação Standalone (HTML Independente)**:
    *   Exporte qualquer deck de flashcards como um único arquivo HTML contendo todos os dados, estilos CSS e sons embutidos.
    *   O arquivo exportado pode ser aberto diretamente em qualquer dispositivo (celular, tablet ou computador), mesmo completamente offline e sem conexão com a internet.
*   **Áudio Embutido**: Efeitos sonoros sutis de virada gerados programaticamente via Web Audio API (sem arquivos `.mp3` externos).

---

## 🚀 Como Executar Localmente

Como o projeto é baseado em **React + Vite**, você pode executá-lo em sua máquina local seguindo estes passos rápidos:

### Pré-requisitos
*   Ter o [Node.js](https://nodejs.org/) instalado em seu computador.

### Passo a Passo

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

3.  **Acesse o aplicativo**:
    Abra o seu navegador no endereço indicado no terminal (normalmente `http://localhost:3000` ou `http://localhost:5173`).

---

## 🌐 Publicando no GitHub & GitHub Pages

Este projeto já está **completamente configurado** para publicação contínua no **GitHub Pages**!

### Passo 1: Criar o Repositório no GitHub
1.  Acesse seu [GitHub](https://github.com/) e crie um novo repositório público ou privado (ex: `flashcard-app`).
2.  **Não** inicialize com README ou .gitignore (o projeto já possui estes arquivos).

### Passo 2: Enviar o Código para o GitHub
Em sua máquina local, no diretório raiz do projeto, execute os comandos no terminal:

```bash
# Inicializar o repositório Git
git init

# Adicionar todos os arquivos
git add .

# Criar o primeiro commit
git commit -m "feat: setup flashcard app com suporte standalone"

# Renomear o branch padrão para main
git branch -M main

# Vincular ao seu repositório do GitHub (Substitua pelo seu link!)
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

# Enviar o código
git push -u origin main
```

### Passo 3: Configurar o GitHub Pages
Graças ao arquivo de fluxo de trabalho do GitHub Actions que criamos em `.github/workflows/static.yml`, o build e deploy são totalmente automáticos. Você só precisa ativar a permissão:

1.  No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2.  No menu lateral esquerdo, sob a seção "Code and automation", clique em **Pages**.
3.  Em **Build and deployment** -> **Source**, selecione **GitHub Actions**.
4.  Pronto! Um pipeline será iniciado automaticamente sob a aba **Actions** e o site será publicado no endereço:
    `https://seu-usuario.github.io/nome-do-repositorio/`

---

## 🛠️ Tecnologia Utilizada

*   **Vite**: Builder ultra-rápido de recursos web.
*   **React 19 & TypeScript**: Estruturação tipada robusta e componentização.
*   **Tailwind CSS**: Estilização altamente otimizada e responsiva para celular, tablet e desktop.
*   **Motion**: Motor de animação física para o efeito 3D flipper.
*   **Lucide React**: Biblioteca de ícones moderna e leve.
