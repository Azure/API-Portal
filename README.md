# API Catalog

**API Catalog is an open-source static developer portal builder. You can use it to effortlessly document REST APIs from OpenAPI files, for free.**

This project is a modified version of the [Azure API Management](https://aka.ms/apimrocks)'s developer portal ([documentation](https://aka.ms/apimdocs/portal), [GitHub](https://aka.ms/apimdevportal)).

![API Catalog](readme.gif)

## Step 1: Document your first API with GitHub Pages

Requirements:

- OpenAPI file with the definition of your API.

GitHub Pages let you automate deployments of your API catalog and publish it to the Internet for free. Follow the steps below to document your API.

1. Fork the GitHub repository.
1. Go to the **Options** tab in your repository's **Settings**.
    1. Change the name of the repository to **[username].github.io** (replace `[username]` with your actual account name) for the site to properly load all the assets. It will be deployed under the URL **https://[username].github.io**, without a URL path suffix. If your repository is part of an organization and not under your individual account, use the organization name in the place of `[username]`.
    1. Scroll down to the **GitHub Pages** section. Select `gh-pages` as the source branch, leave the default root setting, and select **Save**. Copy the GitHub Pages URL (for example, `https://contoso.github.io/`).
1. Go to the **Actions** tab and select **Enable** to enable automated publishing of your site to GitHub Pages.
1. Navigate to `data/specs` in your GitHub repository and drag-and-drop an OpenAPI file. Provide a commit title and select **Commit changes**.
1. The GitHub Action will automatically trigger on the committed change and publish your website. Once it completes, visit the URL you copied in the step 2. (`https://[username].github.io`) to see the published API catalog.

## Step 2: Customize the site

Requirements:

- Git on your machine. Install it by following [this Git tutorial](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
- Node.js (LTS version, `v10.15.0` or later) and npm on your machine. Follow [this tutorial](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install them.

Follow the steps below to customize the content of your API catalog with the built-in drag-and-drop visual interface - edit or create pages, change styling, modify configuration, and more.

1. Clone the forked repository to your local environment.
1. Launch the server.
    1. Open command line and run `npm install` to resolve dependencies.
    1. Run `npm start` to start a local webserver.
1. Open `https://localhost:3000/admin` in a browser to access the administrative interface and make changes. Whenever you make a change, save it by selecting the save button (floppy disk icon) or pressing CTRL+S (Command+S on MacOS). Changes are saved into the `/data/content.json` file. For instructions on customizations and overview of the interface, see [documentation of the Azure API Management's developer portal](https://aka.ms/apimdocs/customizeportal).
1. After making the changes, push them to your GitHub repository.
    1. Run `git add -A` to stage all changes.
    1. Run `git commit -m "Commit message"` to commit them.
    1. Run `git push` to push them to GitHub.
    1. GitHub Action will automatically trigger on the commit in the GitHub's repository. It will build and publish your website into the `gh-pages` branch.
1. After the GitHub Action completes, visit the published site at `https://[username].github.io`.

## Alternative deployment models

### Deploy to Azure App Service

If you're looking to have more control over hosting, you can deploy your site to Azure App Service - a fully managed platform for building, deploying, and scaling web applications.

1. Select the **Deploy to Azure** button at the top of this file.
2. Specify existing Azure App Service instance or create a new one.
3. ...

### Deploy elsewhere

You can also run the publishing step locally and deploy the generated static assets to the hosting solution of choice. To run the publishing step, execute the command `npm run publish` on your local machine.
