const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances
} = require('../controllers/tourController');
const { protect, restrictTo } = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', checkID);
// POST /tour/2345fd/reviews
// GET /tour/2345fd/reviews
// GET /tour/2345fd/reviews/9488fg
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router
  .route(
    protect,
    restrictTo('admin', 'lead-guide', 'guide'),
    '/monthly-plan/:year'
  )
  .get(getMonthlyPlan);

router
  .route('/tours-within/:distancne/center/:latlng/unit/:unit')
  .get(getToursWithin);
// another way /tours-distance?distance=233&center=-40,45&unit=mi
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours) // removing protect middleware, to allow other external api's to use them
  .post(protect, restrictTo('admin', 'lead-guide'), createTour); // allowing only admin and lead guide to create tours

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour) // allowing only admin and lead guide to update tours
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
