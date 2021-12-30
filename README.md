<h1>
  Pet Feeder API
</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Serveless API from the Integration Project 6 of the college.

# :pushpin: Table of Contents

* [Technologies](#-technologies)
* [Installation](#construction_worker-installation)
* [Getting Started](#runner-getting-started)
* [Found a bug? Missing a specific feature?](#bug-issues)
* [Contributing](#tada-contributing)
* [License](#closed_book-license)

## 💻 Technologies

This project was developed with the following technologies:

- [NodeJs](https://nodejs.org/en/)
- [IBM Cloud](https://cloud.ibm.com/)
- [IBM Cloud Functions](https://cloud.ibm.com/functions/)

# :construction_worker: Installation

**You need to install [Node.js](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/) first, then in order to clone the project via HTTPS, run this command:**

```
git clone https://github.com/monteiro-alexandre/pet-feeder-api.git
```

SSH URLs provide access to a Git repository via SSH, a secure protocol. If you use a SSH key registered in your Github account, clone the project using this command:

```
git clone git@github.com:monteiro-alexandre/pet-feeder-api.git
```

Remember that you will need to create a [Google Cloud](https://cloud.ibm.com/) account.

**Install dependencies**

```
yarn install
```

Or

```
npm install
```

Create your environment variables based on the examples of template.local.env

```
cp template.local.env local.env
```

After copying the examples, make sure to fill the variables with new values.

# :runner: Getting Started

To make sure the environment variables is correct, run the following command:

```deploy --env```

Run the following command to deploy the actions to your IBM Cloud Functions:

```deploy --install```

Run the following command to remove the actions into your IBM Cloud Functions:

```deploy --uninstall```

# :bug: Issues

Feel free to **file a new issue** with a respective title and description on the the [Pet Feeder API](https://github.com/monteiro-alexandre/pet-feeder-api/issues) repository. If you already found a solution to your problem, **I would love to review your pull request**! Have a look at our [contribution guidelines](https://github.com/monteiro-alexandre/pet-feeder-api/blob/main/CONTRIBUTING.md) to find out about the coding standards.

# :tada: Contributing

Check out the [contributing](https://github.com/monteiro-alexandre/pet-feeder-api/blob/main/CONTRIBUTING.md) page to see the best places to file issues, start discussions and begin contributing.

# :closed_book: License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
