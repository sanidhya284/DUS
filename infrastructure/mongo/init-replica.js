// Initialize MongoDB replica set for local development
// This script runs once on first container start.
rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'localhost:27017' }],
});
