# Backend for travlel agency CRM project

- **Stack**: Node.js, Express.js, MongoDB, Mongoose.
- **Additional tools**: nodemailer, multer.

The essence of this travel project was to create a CRM system for a local travel agency.

The project encompasses key operations for creating, editing, and deleting hotels and rooms, as well as a complex calculation of accommodation costs involving multiple variables such as the number of people, their ages, meal plans, dates, as well as sending email notifications for both clients and administrators, and more.

Some interesting functionalities:

- Living cost calculation: found in hotelController.js and other resort types' corresponding controllers; these quite complex algorithms use some interesting utils found in utils folder.
- Time periods determination: used in all resort controllers to find the according living price, found in utils folder, periodUtils.js and dateUtils.js.
- Period prices: different resort types use different nesting in there schemas, due to different business models, which led me to develop very different controllers to update and use period prices for each resort type.
- Extra places: necessary to determine the amount of people (adults, kids or babies) which are to be placed into free or cheaper extra places in the same hotel room; used in calculation for hotels, found in utils, freeBabyPlaces.js and removeFreeBabyPlaces.js.
- Overall, I suggest you check out all 4 resort types' controllers, each one of those has some unique functionality that might interest you.

The project hadn't been completed due to financial issues, but is overall functional, though not tested. On the server side, I worked alone for the most part writing the most fundamental features, though there are also some important features written by another developer, like photo uploads, recommendations, price ranges and some others.

The current folder lacks the .env file with DB connection string and jwt secret necessary to run the server.

**Author**: Stanislav Bogdanov (formerly Tiryoshin)

[**Telegram**](https://t.me/stanslv18) [**Linkedin**](https://www.linkedin.com/in/stanislav-tiryoshin/)
