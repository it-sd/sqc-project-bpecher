-- Drop tables if they already exist
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS trips;

-- Create tables
CREATE TABLE trips (
  trip_id INTEGER PRIMARY KEY
);

CREATE TABLE schedule (
  schedule_id INTEGER PRIMARY KEY,
  trip_id INTEGER,
  departure_date DATE,
  arrival_date DATE,
  FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- Insert default data into tables
INSERT INTO trips (trip_id) VALUES (1);
INSERT INTO trips (trip_id) VALUES (2);

INSERT INTO schedule (schedule_id, trip_id, departure_date, arrival_date) VALUES (1, 1, '2023-03-01', '2023-03-05');
INSERT INTO schedule (schedule_id, trip_id, departure_date, arrival_date) VALUES (2, 1, '2023-03-06', '2023-03-10');
INSERT INTO schedule (schedule_id, trip_id, departure_date, arrival_date) VALUES (3, 2, '2023-04-01', '2023-04-05');