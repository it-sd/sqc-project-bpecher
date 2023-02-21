# Plan to Travel with Me!
https://plan-to-travel-wth-me.onrender.com

Your name or CVTC username
Brandon Pecher (bpecher)

Your project description
I want to create a travel planning website. I'd like to include the weather at both the departure location and the arrival location. I also want to have a calendar for checking on planned events during the trip, as well as deletion and modification of those events based on the weather.

Table 1: trip

Column	Type	Description
trip_id	integer	unique identifier for the trip

Table 2: schedule

Column	Type	Description
schedule_id	integer	unique identifier for the schedule
trip_id	integer	foreign key referencing the trip table for the trip associated with this schedule
departure_date	date	date of departure for this schedule
arrival_date	date	date of arrival for this schedule