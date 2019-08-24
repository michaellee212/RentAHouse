# Rent A House


## Built with
Javascript, HTML, CSS, Node.js, Express.js, Mongoose.js, and MongoDB.

## Features
* Features user signup and login authentication with username and password. 
* Create, view, edit and delete posts and comments through restful routing. 
* One cannot edit or delete existing posts and comments created by other users.
* Upload campground photos from local using Cloudinary API and multer.
* Flash messages responding to users’ interaction with the app.
* Uses momentJS to show post and comment creation and update timestamps. 
* Forgot password function sends an email to reset user's password.
* Embedded comment show page in single campground show page to look more user friendly
* Users can create, view, edit, and delete a 5 star review for a listing.
* Users can like a listing and view users who liked the listing. 
* Users can view their profile, showcasing their information and listings. 
* Fuzzy search for listing name or location.
* Muli-page layout. 

## Dependencies
* aysnc
* body-parser
* cloudinary
* connect-flash
* ejs
* express
* expres-session
* moment
* mongoose
* multer
* [nodemailer](https://nodemailer.com/about/)
* passport
* passport-local
* passport-local-mongoose
