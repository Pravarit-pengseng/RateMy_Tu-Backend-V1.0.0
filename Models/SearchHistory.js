const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  searchTerm: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Expires after 1 day (24 * 60 * 60)
  }
}, {
  timestamps: false // We're using custom createdAt
});

// Index for better query performance
searchHistorySchema.index({ createdAt: -1 });
searchHistorySchema.index({ searchTerm: 1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);