var express = require('express');
var router = express.Router();
var House = require('../models/house');
var middleware = require('../middleware');
var Review = require('../models/review');
var Comment = require('../models/comment');

// Multer/Cloudinary
var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function(req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
var upload = multer({
	storage: storage,
	fileFilter: imageFilter
});

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'hlgkve1go',
	api_key: 784981498878813,
	api_secret: 'C1N6bmP-N-TtrSBt7XD7bD6_YJ0'
});

//INDEX - Show all houses
router.get('/', function(req, res) {
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	if (req.query.search) {
		// Fuzzy Search
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		House.find({
			$or: [
				{
					name: regex
				},
				{
					location: regex
				}
			]
		})
			.skip(perPage * pageNumber - perPage)
			.limit(perPage)
			.exec(function(err, allHouses) {
				House.count({
					name: regex
				}).exec(function(err, count) {
					if (err) {
						req.flash('error', err.message);
						res.redirect('back');
					} else {
						// If fuzzy search not found
						if (allHouses.length < 1) {
							req.flash(
								'error',
								'No houses match that search, please try again.'
							);
							return res.redirect('back');
						}
						res.render('houses/index', {
							houses: allHouses,
							current: pageNumber,
							pages: Math.ceil(count / perPage),
							search: req.query.search
						});
					}
				});
			});
	} else {
		// get all houses from DB
		House.find({})
			.skip(perPage * pageNumber - perPage)
			.limit(perPage)
			.exec(function(err, allHouses) {
				House.count().exec(function(err, count) {
					if (err) {
						console.log(err);
					} else {
						res.render('houses/index', {
							houses: allHouses,
							current: pageNumber,
							pages: Math.ceil(count / perPage),
							search: false
						});
					}
				});
			});
	}
});

// CREATE - Add new houses to DB
router.post('/', middleware.isLoggedIn, upload.single('image'), (req, res) => {
	//     var name = req.body.name;
	//     var price = req.body.price;
	//     var image = req.body.image;
	//     var bedrooms = req.body.bedrooms;
	//     var beds = req.body.beds;
	//     var bathrooms = req.body.bathrooms;
	//     var location = req.body.location;
	//     var desc = req.body.description;
	//     var author = {
	//         id: req.user._id,
	//         username: req.user.username
	//     }
	//     var newHouse = {
	//         name: name,
	//         price: price,
	//         image: image,
	//         bedrooms: bedrooms,
	//         beds: beds,
	//         bathrooms: bathrooms,
	//         location: location,
	//         description: desc,
	//         author: author
	//     }
	//     // Create a new house and save to DB
	//     House.create(newHouse, (err, createdHouse) => {
	//         if (err) {
	//             req.flash("error", err.message);
	//         } else {
	//             // Redirect back to list of houses
	//             res.redirect("/houses");
	//         }
	//     })
	// });
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if (err) {
			req.flash('error', "Can't upload image, try again later.");
			return req.redirect('back');
		}
		// add cloudinary url for the image to the house object under image property
		req.body.house.image = result.secure_url;
		// add image's public_id to house object
		req.body.house.imageId = result.public_id;
		// add author to house
		req.body.house.author = {
			id: req.user._id,
			username: req.user.username
		};
		House.create(req.body.house, function(err, house) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/houses/' + house.id);
		});
	});
});

// NEW - Show form to create new house
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('houses/new');
});

// SHOW - Shows more info about one house
router.get('/:id', (req, res) => {
	// Find house with provided ID
	House.findById(req.params.id)
		.populate('comments likes')
		.populate({
			path: 'reviews',
			options: {
				sort: {
					createdAt: -1
				}
			}
		})
		.exec(function(err, foundHouse) {
			if (err || !foundHouse) {
				req.flash('error', 'House not found');
				res.redirect('back');
			} else {
				console.log(foundHouse);
				//render show template with that house
				res.render('houses/show', {
					house: foundHouse
				});
			}
		});
});

// EDIT HOUSE ROUTE
router.get('/:id/edit', middleware.checkHouseOwnership, (req, res) => {
	House.findById(req.params.id, (err, foundHouse) => {
		res.render('houses/edit', {
			house: foundHouse
		});
	});
});

// UPDATE HOUSE ROUTE
router.put(
	'/:id',
	middleware.checkHouseOwnership,
	upload.single('image'),
	(req, res) => {
		//     // Removes any script tags in the body
		//     // req.body.house.body = req.sanitize(req.body.house.body);
		//     House.findById(req.params.id, function (err, house) {
		//         delete req.body.house.rating;
		//         if (err) {
		//             req.flash("error", err.message);
		//             res.redirect("/houses");
		//         } else {
		//             house.name = req.body.house.name;
		//             house.price = req.body.house.price;
		//             house.description = req.body.house.description;
		//             house.image = req.body.house.image;
		//             house.bedrooms = req.body.house.bedrooms;
		//             house.beds = req.body.house.beds;
		//             house.bathrooms = req.body.house.bathrooms;
		//             house.location = req.body.house.location;
		//             house.save(function (err) {
		//                 if (err) {
		//                     req.flash("error", err.message);
		//                     res.redirect("/houses");
		//                 } else {
		//                     res.redirect("/houses/" + house._id);
		//                 }
		//             });
		//         }
		//     });
		// });

		House.findById(req.params.id, async function(err, house) {
			if (err) {
				req.flash('error', err.message);
				res.redirect('back');
			} else {
				if (req.file) {
					try {
						await cloudinary.v2.uploader.destroy(house.imageId);
						var result = await cloudinary.v2.uploader.upload(
							req.file.path
						);
						house.imageId = result.public_id;
						house.image = result.secure_url;
					} catch (err) {
						req.flash('error', err.message);
						return res.redirect('back');
					}
				}
				house.name = req.body.name;
				house.description = req.body.description;
				house.save();
				req.flash('success', 'Successfully Updated!');
				res.redirect('/houses/' + house._id);
			}
		});
	}
);

// DESTROY HOUSE ROUTE
router.delete('/:id', middleware.checkHouseOwnership, function(req, res) {
	House.findById(req.params.id, function(err, house) {
		if (err) {
			res.redirect('/houses');
		} else {
			// deletes all comments associated with the house
			Comment.remove(
				{
					_id: {
						$in: house.comments
					}
				},
				function(err) {
					if (err) {
						console.log(err);
						return res.redirect('/houses');
					}
					// deletes all reviews associated with the house
					Review.remove(
						{
							_id: {
								$in: house.reviews
							}
						},
						function(err) {
							if (err) {
								console.log(err);
								return res.redirect('/houses');
							}
							//  delete the house
							house.remove();
							req.flash('success', 'House deleted successfully!');
							res.redirect('/houses');
						}
					);
				}
			);
		}
	});
});

// House Like Route
router.post('/:id/like', middleware.isLoggedIn, function(req, res) {
	House.findById(req.params.id, function(err, foundHouse) {
		if (err) {
			console.log(err);
			return res.redirect('/houses');
		}
		// check if req.user._id exists in foundHouse.likes
		var foundUserLike = foundHouse.likes.some(function(like) {
			return like.equals(req.user._id);
		});
		if (foundUserLike) {
			// user already liked, removing like
			foundHouse.likes.pull(req.user._id);
		} else {
			// adding the new user like
			foundHouse.likes.push(req.user);
		}

		foundHouse.save(function(err) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('/houses');
			}
			return res.redirect('/houses/' + foundHouse._id);
		});
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
