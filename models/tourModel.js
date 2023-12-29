const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A Tour must have less than or equal to 40 characters'],
      minLength: [10, 'A Tour must have mpre than or equal to 10 characters'],
      validate: [validator.isAlpha, 'Tour Name mush contain only characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a Group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a difficuly'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or hard'
      }
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have price']
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    priceDiscount: {
      type: Number,
      // we have access to input
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW Document creation
          return val < this.price;
        },
        message: 'Discount price should be below the regular price'
      }
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5']
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE:
tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });
  console.log(this);
  next();
});
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//AGGREGATIONG MIDDLEWARE:
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ secretTour: { $ne: true } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
