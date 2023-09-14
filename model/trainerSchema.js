const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  jobtitle: {
    type: String,
    required: true
  },
  instalink: {
    type: String,
    required: true
  },
  fblink: {
    type: String,
    required: true
  },
  twlink: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image:{
    type:String,
    required: true
  },

  classes: [{
    title: {
      type: String,
      required: true
    },
    timing: {
      type: String,
      required: true
    },
    days:{
      type: String,
      required: true
    }
  }],
});

//add classes
trainerSchema.methods.addClasses = async function (title, timing, days) {
  try {
      this.classes = this.classes.concat({ title, timing, days });
      await this.save();
      return this.classes;
  }
  catch (err) {
      console.log(err);
  }
};

const Trainers = mongoose.model('TRAINERS', trainerSchema);

module.exports = Trainers;
