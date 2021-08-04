# Ostendo-Ticketing

## Description
Ticketing platform built to help businesses manage their support tickets. 
#### Motivation
Many smaller companies and businesses still utilize tools such as Excel in order to manually track and record their support tickets. Move to a more scalable solution by allowing users submit their own tickets while also providing and interactive platform to communicate updates and keep administrative records.
#### Features include: 
- Dashboard with search and sort features
- Cross communication within tickets, similar to github issues
- Integration with mailing service for automatic email notifications
- Role based authorization and authentication system
#### Screenshots
<kbd>
<img src="https://i.ibb.co/W6z3vwc/image.png" alt="image">
</kbd>
<br>

#### Technologies:
- MySQL
- React
- Express
- NodeJS

## Setup locally
1. Configure environment variables as given in [env example](.env.example)
2. Configure mySQL database tables by running queries given in [table setup](config/setup.sql)
3. Start the development server: `npm run devStart`
4. Start the local client: `cd client; npm start`
