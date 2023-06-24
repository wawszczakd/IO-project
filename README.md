# Projekt_IO
<!--  ![example workflow](https://github.com/jdziura/Projekt_IO/actions/workflows/django.yml/badge.svg) -->

## Project Description

This project is made for Software Engineering (Inżynieria Oprogramowania) classes at the University of Warsaw, academic year 2022/23.

It is a website that enables playing Hand&Brain chess with other players.

Hand&Brain chess is a variant of chess played by two teams, each consisting of two players. In each team, one player takes on the role of 
the `brain`, and the other player is the `hand`. The `brain` player decides which 
chess piece should be moved, and the `hand` player executes the actual move on the chessboard.

### Features

- Create a room or join an existing one to play Hand&Brain chess with other players.
- Choose your team (Team 1 or Team 2) and your role (brain or hand) within the team.
- The `brain` player selects the chess piece to move, and the `hand` player makes the move on the chessboard.
- Real-time updates to keep track of the current game state and player turns.
- Visual representation of the chessboard using [the javascript chess library](https://chessboardjs.com/docs).

Please note that this is still an early version of the project, and it may be further developed in the future.


## Technologies used

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)


## How to run the project


### Downloading

```shell
    git clone git@github.com:wawszczakd/IO-project.git
    cd IO-project
```
There is a need to install requirements. It is recommened to do it inside a virtual environment.

```shell
    virtualenv venv
    source venv/bin/activate
```

Install requirements

```shell
    pip install -r requirements.txt
```

### Running the project

Open first terminal and type:

```shell
   cd IO-project
   python3 manage.py runserver
```

Open another one and type:

```shell
    cd IO-project
    cd frontend
    npm install
    npm start
```

Go to `localhost:3000` to see the main site.

# TODO: screenshots

