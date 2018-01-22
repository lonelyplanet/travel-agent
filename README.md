[![Build Status](https://travis-ci.org/lonelyplanet/travel-agent.svg?branch=master)](https://travis-ci.org/lonelyplanet/travel-agent)

# Travel Agent

A base express app written in TypeScript to be extended with controllers, and custom middleware.

Built in middlware and support for...

1. React SSR
1. WebPack w/ Hot Loading
1. Default dev and production middleware
1. CLI for generating modules, running dev, building, etc
1. Built in Dependency Injection w/ Inversify

### Modules

Under the `app/modules` directory is where each section of your app can be divided up.

Each "module" should have at least a `controller.ts` and an `index.tsx`.

### Controllers

Extend the `Controller` class from Travel Agent to create a controller.

There are also decorators for each HTTP method which all take a string.

```ts
import { Controller, get } from "@lonelyplanet/travel-agent";

export default class HomeController extends Controller {
  @get("/")
  public async show() {
    this.response.render("home", {
      message: "hello world!",
    });
  }

  @post("/foo/:id")
  public async json() {
    this.response.json({
      foo: `bar ${this.request.params.id}`,
    });
  }
}
```

### Tags

#### Helmet

You can import `Helmet` like this...

```ts
import { Helmet } from "@lonelyplanet/travel-agent/helmet";

export default ({}) => (
  <React.Fragment>
    <Helmet>
      <title>Cool, a title tag</title>
    </Helmet>
    <div>Oh yeah</div>
  </React.Fragment>
);
```

### Configuration

There are a few configuration options you can define in a `config/index.js` file.

```
{
  // An array of middleware
  middleware: [],
  prometheus: {
    defaultPath: "other", /* defaults to the current url */,
  },
  webpack: { /* webpack config options */ },
  production: {
    webpack: { /* production webpack config options */ },
    airbrakeId: "123445",
    airbrakeKey: "abckey12345",
  }
}
```

If you would like to disable webpack, simply do `webpack: false`.

### Using Dependency Injection

In `app/index.ts` once you call `start`, you can bind services.

```ts
import "reflect-metadata";
import start from "@lonelyplanet/travel-agent";
import FooService from "./services/fooService";

const app = start();

app.bind("FooService").to(FooService);
```

Then in your controller, you can inject it...

```ts
export default class HomeController extends Controller {
  foo: IFooService;

  constructor(@inject("FooService") foo?: IFooService) {
    super();

    this.foo = foo;
  }

  @get("/")
  public async show() {
    const foo = await this.foo.fetch();

    this.response.render("home", {
      message: `hell effin yea ${foo[0].name}!`,
    });
  }
}
```

## Examples

Look in the `packages/travel-agent-example` for a working example that Should Just Work (tm).

### Running the included example

After cloning the repo, run...

```bash
npm i
lerna bootstrap
cd packages/travel-agent-example
npm run start
```

### Getting started with your own app

#### Install the Yeoman generator

```
npm install -g yo @lonelyplanet/generator-travel-agent
```

You'll need to have Node >= 8 on your machine.

#### Create your app

```
mkdir my-app
cd my-app
yo @lonelyplanet/travel-agent
```

#### Run the app

```
travel-agent dev
```

Open http://localhost:3000 to view it in the browser.

#### Other commands

* Add a new module to your app

```
travel-agent add module my-module-name
```

* Build the app into the `dist` folder

```
travel-agent build
```

* Run the server in production mode

```
travel-agent start
```

### Troubleshooting

* Can't get hot loading to work because of 404? Try nuking your `public/assets` dir and restarting the server
