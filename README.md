# Rainier Athletes Backend API

The RA Backend will be a MongoDB-based API server designed for future enhancement. The initial MVP implementation will feature two models (Profile and PointTracker) along with associated routes.  We will implement an admin function with the ability to initialize profiles with email addresses and roles so that Google Oauth can be used while maintaining access control.

Relationships between models can be deduced from the mock JSON below, but in brief they are:

	- Profile[role=student] to PointTracker, 1:Many
	- Profile[role=student] to Profile[role=coach], 1:Many
	- Profile[role=student] to Profile[role=teacher], 1:Many
	- Profile[role=student] to Profile[role=family], 1:Many
	- Profile[role=student] to Profile[role=mentor], 1:1
	- Profile[role=mentor] to Profile[role=student], 1:Many
	- Profile[role=teacher] to Profile[role=student], 1:Many
	- Profile[role=coach] to Profile[role=student], 1:Many
	- Profile[role=family] to Profile[role=student], 1:Many
	- PointTracker to Profile[role=teacher], 1:Many
	- PointTracker to Profile[role=student], 1:1

## Setup: .env file
```
NODE_ENV=[ development|production ] // pick one
PORT=3000 // server port in dev (localhost)
MONGODB_URI=mongodb://localhost:27017/<your db name> 
SECRET=<your jwt secret> // used to sign web tokens
GOOGLE_OAUTH_ID=<your google oauth id>
GOOGLE_OAUTH_SECRET=<your google oauth secret>
CLIENT_URL=http://localhost:8080 // set this to your deployed frontend when you deploy
API_URL=http://localhost:3000/api/v1 // set this to your deployed backend when you deploy
CORS_ORIGINS=["http://localhost:8080", "<another client url>", "<etc>"] // CORS whitelist for origins
ROOT_ADMIN={"email": "selpilot@gmail.com", "role": "admin"} // use this id to bootstrap oauth signin
```

## Routes

### POST
  - /api/v1/profiles
  - /api/v1/pointstracker
  - /api/v1/synopsis
    - Returns webViewLink, a shareable URL, for the PDF file in the user's google drive.
    - Body requires name and html parameters. Name is student's name. Html is html string for the synopsis report.

### GET
	- /api/v1/oauth/google
  - /api/v1/profiles?[id | any profile property]=[mongoose._id | corresponding property value]
  - /api/v1/profiles/me
  - /api/v1/pointstracker?[id | any profile property]=[mongoose._id | corresponding property value]
    - We'll need to experiment with the date query to be sure date is formatted correctly. And that it's a valid report date (a Friday).
	-/api/v1/attach?student=mongoose._id&[mentor|coach|teacher|family]=mongoose._id
	-/api/v1/detach?student=mongoose._id&[mentor|coach|teacher|family]=mongoose._id
  - /api/v1/extract?from=date&to=date
    - Extracts pointstracker data to csv and posts to user's google drive.
    - Returns webViewLink, a shareable URL, for the CSV file in the user's google drive.


### PUT
  - /api/v1/profiles?id=mongoose._id
  - /api/v1/pointstracker?id=mongoose._id

### DELETE
  - /api/v1/profiles?id=mongoose._id
  - /api/v1/pointstracker?id=mongoose._id
  
## Permission Roles

This table may be significantly modified if we can simplify things down to just mentors as users who create students and coaches as needed.

 Role | Profile | PointTracker 
:---|:---:|:---:|:---:
admin | CRUD | CRUD
mentor | RU* | RU
others |  - | -

\*Student profiles only

## Mock JSON

### GET /api/v1/pointstracker?id=5b75bbdd2d60007306e782ef JSON
```
[
    {
        "surveyQuestions": {
            "mentorAttendedCheckin": true,
            "metFaceToFace": true,
            "hadOtherCommunication": false,
            "hadNoCommunication": false,
            "scoreSheetTurnedIn": true,
            "scoreSheetLostOrIncomplete": false,
            "scoreSheetWillBeLate": false,
            "scoreSheetOther": false,
            "scoreSheetOtherReason": "no reason needed in this case",
            "synopsisInformationComplete": true,
            "synopsisInformationIncomplete": false,
            "synopsisCompletedByRaStaff": false
        },
        "synopsisComments": {
            "extraPlayingTime": "saepe id in",
            "mentorGrantedPlayingTime": "one quarter",
            "studentActionItems": "ea est recusandae",
            "sportsUpdate": "magnam repellat quo",
            "additionalComments": "sint quia aut"
        },
        "_id": "5b75bbdd2d60007306e782ef",
        "date": "2018-08-16T18:01:01.836Z",
        "student": {
            "studentData": {
                "coaches": [],
                "teachers": [],
                "family": [],
                "lastPointTracker": "5b75bbdd2d60007306e782ef"
            },
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b75bbdd2d60007306e782c7",
            "firstName": "Xzavier",
            "lastName": "Macejkovic",
            "email": "Theodora_Nicolas79@yahoo.com",
            "phone": "069.155.4058",
            "gender": "male",
            "school": "skyline high school",
            "__v": 0
        },
        "subjects": [
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b75bbdd2d60007306e782f6",
                "subjectName": "Ada",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782d0",
                    "firstName": "Dexter",
                    "lastName": "Schamberger",
                    "email": "Rylan.Kassulke@yahoo.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b75bbdd2d60007306e782f5",
                "subjectName": "Viva",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782d5",
                    "firstName": "Cristobal",
                    "lastName": "Stiedemann",
                    "email": "Pierce2@gmail.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b75bbdd2d60007306e782f4",
                "subjectName": "Caleigh",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782da",
                    "firstName": "Diamond",
                    "lastName": "Corwin",
                    "email": "Ahmad.Reichert88@hotmail.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b75bbdd2d60007306e782f3",
                "subjectName": "Samanta",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782df",
                    "firstName": "Lexi",
                    "lastName": "Runolfsdottir",
                    "email": "Harmon_Paucek73@gmail.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b75bbdd2d60007306e782f2",
                "subjectName": "Antonio",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782e4",
                    "firstName": "Helmer",
                    "lastName": "Hansen",
                    "email": "Reuben.Farrell8@yahoo.com",
                    "__v": 0
                },
                "grade": 90
            },
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b75bbdd2d60007306e782f1",
                "subjectName": "Lila",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782e9",
                    "firstName": "Sam",
                    "lastName": "Hilll",
                    "email": "Brayan.Nader@hotmail.com",
                    "__v": 0
                },
                "grade": 70
            },
            {
                "scoring": {
                    "excusedDays": 3,
                    "stamps": 4,
                    "halfStamp": 1,
                    "tutorials": 1
                },
                "_id": "5b75bbdd2d60007306e782f0",
                "subjectName": "Sabryna",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "teachers": [],
                        "family": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b75bbdd2d60007306e782ee",
                    "firstName": "Woodrow",
                    "lastName": "Rippin",
                    "email": "Zoila3@hotmail.com",
                    "__v": 0
                },
                "grade": 90
            }
        ],
        "__v": 0
    }
]
```

### Student Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c7
```
{
    "studentData": {
        "coaches": [],
        "teachers": [],
        "family": [],
        "lastPointTracker": {
            "surveyQuestions": {
                "mentorAttendedCheckin": true,
                "metFaceToFace": true,
                "hadOtherCommunication": false,
                "hadNoCommunication": false,
                "scoreSheetTurnedIn": true,
                "scoreSheetLostOrIncomplete": false,
                "scoreSheetWillBeLate": false,
                "scoreSheetOther": false,
                "scoreSheetOtherReason": "no reason needed in this case",
                "synopsisInformationComplete": true,
                "synopsisInformationIncomplete": false,
                "synopsisCompletedByRaStaff": false
            },
            "synopsisComments": {
                "extraPlayingTime": "saepe id in",
                "mentorGrantedPlayingTime": "one quarter",
                "studentActionItems": "ea est recusandae",
                "sportsUpdate": "magnam repellat quo",
                "additionalComments": "sint quia aut"
            },
            "_id": "5b75bbdd2d60007306e782ef",
            "date": "2018-08-16T18:01:01.836Z",
            "student": {
                "studentData": {
                    "coaches": [],
                    "teachers": [],
                    "family": [],
                    "lastPointTracker": "5b75bbdd2d60007306e782ef"
                },
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b75bbdd2d60007306e782c7",
                "firstName": "Xzavier",
                "lastName": "Macejkovic",
                "email": "Theodora_Nicolas79@yahoo.com",
                "phone": "069.155.4058",
                "gender": "male",
                "school": "skyline high school",
                "__v": 0
            },
            "subjects": [
                {
                    "scoring": {
                        "excusedDays": 1,
                        "stamps": 2,
                        "halfStamp": 3,
                        "tutorials": 2
                    },
                    "_id": "5b75bbdd2d60007306e782f6",
                    "subjectName": "Ada",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782d0",
                        "firstName": "Dexter",
                        "lastName": "Schamberger",
                        "email": "Rylan.Kassulke@yahoo.com",
                        "__v": 0
                    },
                    "grade": 70
                },
                {
                    "scoring": {
                        "excusedDays": 3,
                        "stamps": 4,
                        "halfStamp": 1,
                        "tutorials": 1
                    },
                    "_id": "5b75bbdd2d60007306e782f5",
                    "subjectName": "Viva",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782d5",
                        "firstName": "Cristobal",
                        "lastName": "Stiedemann",
                        "email": "Pierce2@gmail.com",
                        "__v": 0
                    },
                    "grade": 90
                },
                {
                    "scoring": {
                        "excusedDays": 1,
                        "stamps": 2,
                        "halfStamp": 3,
                        "tutorials": 2
                    },
                    "_id": "5b75bbdd2d60007306e782f4",
                    "subjectName": "Caleigh",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782da",
                        "firstName": "Diamond",
                        "lastName": "Corwin",
                        "email": "Ahmad.Reichert88@hotmail.com",
                        "__v": 0
                    },
                    "grade": 70
                },
                {
                    "scoring": {
                        "excusedDays": 3,
                        "stamps": 4,
                        "halfStamp": 1,
                        "tutorials": 1
                    },
                    "_id": "5b75bbdd2d60007306e782f3",
                    "subjectName": "Samanta",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782df",
                        "firstName": "Lexi",
                        "lastName": "Runolfsdottir",
                        "email": "Harmon_Paucek73@gmail.com",
                        "__v": 0
                    },
                    "grade": 90
                },
                {
                    "scoring": {
                        "excusedDays": 3,
                        "stamps": 4,
                        "halfStamp": 1,
                        "tutorials": 1
                    },
                    "_id": "5b75bbdd2d60007306e782f2",
                    "subjectName": "Antonio",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782e4",
                        "firstName": "Helmer",
                        "lastName": "Hansen",
                        "email": "Reuben.Farrell8@yahoo.com",
                        "__v": 0
                    },
                    "grade": 90
                },
                {
                    "scoring": {
                        "excusedDays": 1,
                        "stamps": 2,
                        "halfStamp": 3,
                        "tutorials": 2
                    },
                    "_id": "5b75bbdd2d60007306e782f1",
                    "subjectName": "Lila",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782e9",
                        "firstName": "Sam",
                        "lastName": "Hilll",
                        "email": "Brayan.Nader@hotmail.com",
                        "__v": 0
                    },
                    "grade": 70
                },
                {
                    "scoring": {
                        "excusedDays": 3,
                        "stamps": 4,
                        "halfStamp": 1,
                        "tutorials": 1
                    },
                    "_id": "5b75bbdd2d60007306e782f0",
                    "subjectName": "Sabryna",
                    "teacher": {
                        "studentData": {
                            "coaches": [],
                            "teachers": [],
                            "family": []
                        },
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b75bbdd2d60007306e782ee",
                        "firstName": "Woodrow",
                        "lastName": "Rippin",
                        "email": "Zoila3@hotmail.com",
                        "__v": 0
                    },
                    "grade": 90
                }
            ],
            "__v": 0
        }
    },
    "active": true,
    "role": "student",
    "students": [],
    "_id": "5b75bbdd2d60007306e782c7",
    "firstName": "Xzavier",
    "lastName": "Macejkovic",
    "email": "Theodora_Nicolas79@yahoo.com",
    "phone": "069.155.4058",
    "gender": "male",
    "school": "skyline high school",
    "__v": 0
}
```

### Mentor (or any adult role) Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c8
```
{
    "studentData": {
        "coaches": [],
        "teachers": [],
        "family": []
    },
    "active": true,
    "role": "mentor",
    "students": [
        {
            "studentData": {
                "coaches": [],
                "teachers": [],
                "family": [],
                "lastPointTracker": "5b75bbdd2d60007306e782ef"
            },
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b75bbdd2d60007306e782c7",
            "firstName": "Xzavier",
            "lastName": "Macejkovic",
            "email": "Theodora_Nicolas79@yahoo.com",
            "phone": "069.155.4058",
            "gender": "male",
            "school": "skyline high school",
            "__v": 0
        },
        {
            "studentData": {
                "coaches": [],
                "teachers": [],
                "family": [],
                "lastPointTracker": "5b75bbdd2d60007306e782ef"
            },
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b75bbdd2d60007306e782c7",
            "firstName": "Xzavier",
            "lastName": "Macejkovic",
            "email": "Theodora_Nicolas79@yahoo.com",
            "phone": "069.155.4058",
            "gender": "male",
            "school": "skyline high school",
            "__v": 0
        }
    ],
    "_id": "5b75bbdd2d60007306e782c8",
    "firstName": "Conner",
    "lastName": "Mosciski",
    "email": "Brant_Rowe@hotmail.com",
    "phone": "843.176.0624",
    "gender": "female",
    "__v": 0
}
```

