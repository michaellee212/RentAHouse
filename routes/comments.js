var express = require("express");
var router = express.Router({
    mergeParams: true
});
var House = require("../models/house");
var Comment = require("../models/comment");
var middleware = require("../middleware");


// COMMENTS ROUTES
// =====================
// comments new
router.get("/new", middleware.isLoggedIn, (req, res) => {
    // find house by id
    House.findById(req.params.id, (err, house) => {
        if (err) {
            req.flash("error", err.message);
            console.log(err);
        } else {
            res.render("comments/new", {
                house: house
            });
        }
    })
})

// Creates comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    // lookup house usisng ID
    House.findById(req.params.id, (err, house) => {
        if (err) {
            req.flash("error", "Comment not found");
            res.redirect("/houses");
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save id
                    comment.save();
                    // connect new comment to house
                    house.comments.push(comment);
                    house.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/houses/" + house._id);
                }
            })
        }
    })
})

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    House.findById(req.params.id, (err, foundHouse) => {
        if (err || !foundHouse) {
            req.flash("error", "No house found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {
                    house_id: req.params.id,
                    comment: foundComment
                });
            }
        });
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    // Removes any script tags in the body
    // req.body.comment.body = req.sanitize(req.body.comment.body);
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
            req.flash("error", err.message);
        } else {
            res.redirect("/houses/" + req.params.id);
        }
    })
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
            req.flash("error", err.message);
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/houses/" + req.params.id);
        }
    })
});



module.exports = router;