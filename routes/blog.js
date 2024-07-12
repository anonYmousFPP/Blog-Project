const {Router} = require('express');
const path = require('path');
const multer = require('multer');
const router = Router();
const Blog = require('../models/blog');
const Comment = require('../models/comment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
  })
  
  const upload = multer({ storage: storage })

router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user : req.user,
    })
})

router.get('/:id', async (req, res) => {
    console.log('Inside comment 1');
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    console.log('my blog ', blog);
    
    console.log('Inside comment 2');
    const comments = await Comment.find({blogId: req.params.id}).populate('createdBy');
    
    console.log('Inside comment 3');
    console.log('Inside comment 3');
    return res.render('blog', {
        user: req.user,
        blog,
        comments,
    });
})

router.post('/comment/:blogId', async(req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        creatdBy: req.user._id,
    })
    console.log('Successfully created');
    return res.redirect(`/blog/${req.params.blogId}`);
} )

router.post('/', upload.single('coverImage'), async (req, res) => {
    const {title, body} = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
})

module.exports = router;