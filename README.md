# simc-web

A simple node.js powered front-end to the [simulationcraft/simc](https://github.com/simulationcraft/simc) executable.

## Setting Up

Get an API key (read more [here](https://github.com/simulationcraft/simc/wiki/BattleArmoryAPI)), and put it in the root directory of this repository.

Build the docker container:

```bash
docker build -t simc-web .
```

Then run the container:

```bash
docker run -it -p 8080:8080 simc-web
```

## Usage

Now you can make requests to the web app:

```bash
curl -X POST --data "armory=us,drenden,calnus" http://localhost:8080/simc
```

This software is provided as-is with no warranty. This project is unaffiliated with simulationcraft.