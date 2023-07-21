const express = require('express');
const { restart } = require('nodemon');
const {Category, Category} = require('../model/category');
const router = express.Router;

router.get('/', async (req, res) =>
{
    const categoryList = await Category.find();

    if (!categoryList)
    {
        res.status(500),json({success: false})
    }

    res.send(categoryList);
})

router.get('/:id', async(req,res) =>
{
    const Category = await Category.findById(req.params.id);

    if (!category)
    {
        res.status(500).json({message: 'Category is missing!'})
    }

    res.status(200).send(category);
})

router.post('/', async (req, res) =>
{
    let category = new Category
    ({
        name: req.body.name,
    })
    
    category = await category.save();
    
    if (!category)
    {
        return res.status(404).send('Product Category cannot be created.')
    }

    res.send(category);
})

router.delete('/catID', async (req, res) =>
{
    Category.findByIdAndDelete(req.params.catID).then(category =>
    {
        if (category) 
        {
            return res.status(200).json
            ({
                success: true, 
                message: "Category has been succesfully deleted.",  
            })
        }
        else
        {
            return res.status(404).json
            ({
                success: false, 
                message: "Category is not found.",  
            })
        }
    })
})

module.exports = router;