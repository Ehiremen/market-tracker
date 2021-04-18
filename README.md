# market-tracker
single-page react app that allows users request to be notified about specific changes in the price of stocks or crypto currencies.

### key details
- doesn't allow signing into portfolios to avoid security breaches.
- doesn't store user names or emails to help promote some form of privacy.

### tech stack:
- react (front end)
- express (server side integration)
- axios
- mongo db (store requests)
- twilio api (sms notifications)
- alphaVantage api (market data)

[app demo](https://youtu.be/SxEvXNFaZf8)

### to deploy:
- __backend:__ run "npm start from root directory. (NOTE: runs on __localhost:5000__)
- __frontend:__ run "npm start" from "front-end" directory (NOTE: runs on __localhost:3000__)

#### NOTE:
Need to create a '.env' file in the root directory to run the backend locally. Add the following lines (no quotes, and no leading '-') to the .env:
- TWILIO_ACCOUNT_SID=your_twilio_sid
- TWILIO_AUTH_TOKEN=your_twilio_token
- TWILIO_PHONE_NUMBER=your_twilio_phone_num
- ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
- ALPHA_VANTAGE_DATA_TYPE=json

Also NOTE:
    Twilio free tier users can only send sms notifications to verified numbers (i.e. you will need to recieve a verification code on that number first and approve it). Because of this, you can't sms just anyone.


# Done for and during the 2021 UofIowa Hackathon
