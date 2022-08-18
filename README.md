# Air Quality Managemnet

This is an air Quality report base web application

## Key Technologies

**Client-Side:** Next js, Redux, TailwindCSS

**Server-Side:** Node JS, Express JS

**Database:** MySQL (with ORM TypeORM)

**Language:** TypeScript (server), JavaScript(client)

## Key Roles

- Agency

## Key Features

- Full registration process include login system for agency.
- If user forgot password then a 4 digits OTP will sent to their contact number or email. And after verify it user can recover their forgot password.
- Agency can update there password but to update their exist password he/she needs to put their current password and then he or she can able to update their exist password.
- If user dont want to upload any title or cover picture during registration time then a default profile picture will be upload
- Individual Agency can read write and delete own input daily or final air quality data.
- Agency can input different type of air data in daily basis and final report by upload csv file or in manual way by using a form.
- Normal user can see different type or Air Quality by many way in some graphical representation by using chart.

## Demo

Ongoing Project......

## Run Locally

Clone the project

```bash
  git clone https://github.com/SYShopnil/Air-Quality-Data-Collection-Server-.git
```

Go to the project directory

```bash
  cd Air-Quality-Data-Collection-Server-
```

Install dependencies

```bash
  npm install || npm i
```

Start the server

```bash
  npm run dev
```

## Installation

Install my-project with npm

```bash
  npm install || npm i
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

**`PORT`** //this will be the server port

**`TYPEORM_CONNECTION`** //this will be data base type example: mysql

**`TYPEORM_HOST`** //this will be the hosting server Example: localhost

**`TYPEORM_PORT`** //this will be the database server port Example: 3306 (default for xampp)

**`TYPEORM_USERNAME`** //this will be the databse user name Example: `root` for xampp sever default

**`TYPEORM_DATABASE`** //this will be the databse name. At first user need to create a database and then insert the name here Example:airQuality (a random databse name)

**`TYPEORM_SYNCHRONIZE`** //this will sync the databse table and build the table. It has two value `true or false` default value is `false`

**`TYPEORM_LOGGING`**//this will print the sql raw query in the CLI. It has two value `true or false` default value is `false`

**`TYPEORM_ENTITIES`** //this will denote the directory of all entities Example: `./src/entites/**/*.ts`

**`TYPEORM_SUBSCRIBERS`** //this will denote the directory of all subscriber Example: `./src/subscriber/**/*.ts`

**`TYPEORM_MIGRATIONS`** //this will denote the directory of all migration Example: `./src/migration/**/*.ts`

**`TYPEORM_ENTITIES_DIR`** // dentoe the entities directory example; ` src/model`

**`TYPEORM_MIGRATIONS_DIR`** // dentoe the entities directory example; ` src/migration`

**`TYPEORM_SUBSCRIBERS_DIR`** // dentoe the entities directory example; ` src/subscriber`

**`JWT_CODE`** // this will the jwt toke's secrete code

**`HOST_EMAIL`** // this will be a outlook email for sent the email via node mailer example: `"nishatNiks@outlook.com"`

**`HOST_PASSWORD`** //this will be password of host email which using in the node mailer

**`SENDER_EMAIL`** // this will be a outlook email where you can sent a email via node mailer example: `"nishatNiks@outlook.com"`

**`TOKE_EXPIRE_IN`** //this will be jwt token expire time. It is count in Days Example: `"5d"`

**`COOKIE_EXPIRE_IN`** //this will also a expire time of cookies It is also count in Days Exapmle: `5` mean **`5` days**

**`OTP_SEND_DIGIT`** //this will denote how many number of digit does an OTP should be Example: `4` mean **`4` Digits**

**`OTP_EXPIRE_IN`** //this will denote the expire time of OTP in `Days`. example: `"5d"` mean **`Five` Days**

**`OTP_COOKIES_EXPIRE_IN`** //this will denote the otp send cookies expire date what will be set during the forgot password time in the cookies of the browser. Example: `1` mean **`ONE` day**

**`SERVER_BASE_URL`** //this will be the server's base url. Example: `"http://localhost:3030"`

**`CORS_ORIGIN`** //this will be the cors origin basicially the client site base url. Exapmle : `"http://localhost:3000"` Deafult base url of next js

## Documentation

[Database Design](https://drive.google.com/open?id=1tk3RPU-0j128TrvxpbJ3AWMHm9J3D4b4)

[ERD Relationship](https://drive.google.com/file/d/1AxAZTFrwzDiSXbuD7e-iw0MW6JFx9LcQ/view?usp=sharing)

[API- Overview](https://drive.google.com/file/d/1fL4Em8JIFa3ZoCo_XrO31QAhZu0mZ0TK/view?usp=sharing)

[API- Doc](https://drive.google.com/file/d/1nWZXvg0A3mWNfNHHpTrlx11XGOZ3H_wH/view?usp=sharing)

[POST_MAN](https://www.postman.com/red-trinity-151066/workspace/air-quality-app)

## Support

For support, sadmanishopnil@gmail.com
