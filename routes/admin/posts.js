const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const {userAuthentication} = require('../../helpers/authentication');

router.all('/*',userAuthentication, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});


router.get('/', (req, res) => {
    Post.find({})
    .populate('category')
    .then(posts => {
        res.render('admin/posts', {
            posts: posts
        });
    })
})

router.get('/my-posts', (req, res) => {
    Post.find({user: req.user.id})
        .populate('category')
        .then(posts => {
            res.render('admin/posts/my-posts', {posts: posts});
        })
})

router.get('/create', (req, res) => {
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {categories: categories});
    });
    
})


router.post('/create', (req, res) => {

    let errors = [];

    if(!req.body.title) {
        errors.push({
            message: 'please add a title'
        })
    }
    if(!req.body.body) {
        errors.push({
            message: 'please add Description'
        })
    }
    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        let filename = 'bg.jpg';

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            let dirUplaods = './public/uploads/';
            file.mv(dirUplaods + filename, (err) => {
                if (err) throw err;
            });
        }


        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: filename
        })

        newPost.save().then(savedPost => {
            req.flash('success_message', `${savedPost.title} was Created Successfully`);
            res.redirect('/admin/posts');
        }).catch(error => {
            console.log(error);
        })
    }
});


router.get('/edit/:id', (req, res) => {

    Post.findOne({
        _id: req.params.id
    }).then(post => {
        Category.find({}).then(categories=> {
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });
});


router.put('/edit/:id', (req, res) => {

    Post.findOne({
        _id: req.params.id
    }).then(post => {

        if (req.body.allowComments) allowComments = true;
        else allowComments = false;

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        if(!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            post.file = filename;
            file.mv('./public/uploads/' + filename, (err) => {
                if(err) throw err;
            });
        }


        post.save().then(updatePost => {

            req.flash('success_message', 'Post was Successfully updated');

            res.redirect('/admin/posts/my-posts');
        });
    });
});


router.delete('/:id', (req, res) => {
    Post.findOne({
            _id: req.params.id
        })
        .populate('comments')
        .then(post => {
            fs.unlink(uploadDir + post.file, (err) => {

                if(post.comments.length) {
                    post.comments.forEach(comment => {
                        comment.remove();
                    });
                }

                post.remove().then(postRemoved =>{
                    //res.flash('success_message', 'Post was successfully deleted.');
                    res.redirect('/admin/posts/my-posts');
                });
            });
        });
});


module.exports = router;