const express = require('express');
const router = express.Router();
const {verifyToken} = require('../authorization/auth');

const {showRecipes,showSingleRecipe,loginUser,registerUser,updateProfile} = require('../controllers/recipes');

router.route('/userRecipe').get(showRecipes);
router.route('/userRecipeClick/').get(showSingleRecipe);
// router.route('/users/info/').get(userProfile);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/updateProfile').patch(updateProfile);
// router.route('/me').get(myProfile);

module.exports = router;