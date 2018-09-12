# Rainier Athletes Backend API

The RA Backend will be a MongoDB-based API server designed for future enhancement. The initial MVP implementation will feature two models (Profile and PointTracker) along with associated routes.  We will implement an admin function with the ability to initialize profiles with email addresses and roles so that Google Oauth can be used while maintaining access control.

Relationships between models can be deduced from the mock JSON below, but in brief they are:

	- Profile[role=student] to PointTracker, 1:Many
	- Profile[role=student] to Profile[role=coach], 1:Many
	- Profile[role=student] to Profile[role=teacher], 1:Many
	- Profile[role=student] to Profile[role=family], 1:Many
	- Profile[role=student] to Profile[role=mentor], 1:1
	- Profile[role=mentor] to Profile[role=student], 1:Many
    - Profile[role=mentor] to PointTracker, 1:Many
	- Profile[role=teacher] to Profile[role=student], 1:Many
	- Profile[role=coach] to Profile[role=student], 1:Many
	- Profile[role=family] to Profile[role=student], 1:Many
	- PointTracker to Profile[role=teacher], 1:Many
	- PointTracker to Profile[role=student], 1:1
    - StudentData to Profile[role=student] 1:1

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
    - Returns webViewLink, a shareable URL, for the PDF file in the user's google drive:
    ```
    {
        "webViewLink": "https://drive.google.com/file/d/150JHOsRJ0-FqEr6gH4eoufLISAu-aOgA/view?usp=drivesdk"
    }
    ```
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
    - Returns webViewLink, a shareable URL, for the CSV file in the user's google drive:
    ```
    {
        "webViewLink": "https://drive.google.com/file/d/150JHOsRJ0-FqEr6gH4eoufLISAu-aOgA/view?usp=drivesdk"
    }
    ```
  - /ap/v1/studentdata?[id | student ]=mongoose._id


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
NOTE: an admin can GET with no query string to retrieve all points trackers, in which case the result will be an array of populated objects
```
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
            "extraPlayingTime": "ut nemo reprehenderit",
            "mentorGrantedPlayingTime": "one quarter",
            "studentActionItems": "velit est ab",
            "sportsUpdate": "nam repudiandae odit",
            "additionalComments": "cum odio corrupti"
        },
        "_id": "5b96f6ab4be48399f6a56d66",
        "date": "2018-09-10T22:56:43.361Z",
        "student": {
            "studentData": {
                "gender": "male",
                "mentors": [
                    {
                        "_id": "5b96f6aa4be48399f6a56d30",
                        "id": "5b96f6aa4be48399f6a56d2e",
                        "currentMentor": true
                    }
                ],
                "school": [
                    {
                        "_id": "5b96f6aa4be48399f6a56d31",
                        "schoolName": "skyline high school",
                        "currentSchool": true
                    }
                ],
                "coaches": [],
                "sports": [],
                "teachers": [],
                "family": [],
                "lastPointTracker": "5b96f6ab4be48399f6a56d66"
            },
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b96f6aa4be48399f6a56d2f",
            "firstName": "Daniella",
            "lastName": "Effertz",
            "email": "Giovanni41@hotmail.com",
            "phone": "397.230.9032",
            "__v": 0
        },
        "mentor": {
            "studentData": {
                "coaches": [],
                "sports": [],
                "mentors": [],
                "teachers": [],
                "family": [],
                "school": []
            },
            "active": true,
            "role": "mentor",
            "students": [],
            "_id": "5b96f6aa4be48399f6a56d2e",
            "firstName": "Darien",
            "lastName": "Doyle",
            "email": "Rosalinda_Gerhold30@hotmail.com",
            "phone": "400.385.7439",
            "__v": 0
        },
        "mentorIsSubstitute": false,
        "subjects": [
            {
                "scoring": {
                    "excusedDays": 1,
                    "stamps": 2,
                    "halfStamp": 3,
                    "tutorials": 2
                },
                "_id": "5b96f6ab4be48399f6a56d6d",
                "subjectName": "Gloria",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d3b",
                    "firstName": "Iliana",
                    "lastName": "Collier",
                    "email": "Stuart_Boyle@gmail.com",
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
                "_id": "5b96f6ab4be48399f6a56d6c",
                "subjectName": "Ubaldo",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d42",
                    "firstName": "Madie",
                    "lastName": "Dare",
                    "email": "Dayna56@hotmail.com",
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
                "_id": "5b96f6ab4be48399f6a56d6b",
                "subjectName": "Orland",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d49",
                    "firstName": "Edmond",
                    "lastName": "Hartmann",
                    "email": "Chris_Rolfson@hotmail.com",
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
                "_id": "5b96f6ab4be48399f6a56d6a",
                "subjectName": "Bo",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d50",
                    "firstName": "Turner",
                    "lastName": "Jenkins",
                    "email": "Holden_Strosin@yahoo.com",
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
                "_id": "5b96f6ab4be48399f6a56d69",
                "subjectName": "Alana",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d57",
                    "firstName": "Frank",
                    "lastName": "Cole",
                    "email": "Dejah.Renner14@hotmail.com",
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
                "_id": "5b96f6ab4be48399f6a56d68",
                "subjectName": "Barton",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d5e",
                    "firstName": "Kelly",
                    "lastName": "Klocko",
                    "email": "Tressie_Tremblay@gmail.com",
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
                "_id": "5b96f6ab4be48399f6a56d67",
                "subjectName": "Jordan",
                "teacher": {
                    "studentData": {
                        "coaches": [],
                        "sports": [],
                        "mentors": [],
                        "teachers": [],
                        "family": [],
                        "school": []
                    },
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b96f6ab4be48399f6a56d65",
                    "firstName": "Macy",
                    "lastName": "Hartmann",
                    "email": "Burley_Carroll79@gmail.com",
                    "__v": 0
                },
                "grade": 90
            }
        ],
        "createdAt": "2018-09-10T22:56:43.387Z",
        "updatedAt": "2018-09-10T22:56:43.387Z",
        "__v": 0
    }

```

### Student Data GET /api/v1/studentdata?id=5b99757623f82f62586e9369
```
    [
        {
            "synergy": {
                "username": "SynergyUser",
                "password": "cGFzc3dvcmQ="
            },
            "_id": "5b99757623f82f62586e9369",
            "student": {
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b99757523f82f62586e933a",
                "firstName": "Edwin",
                "lastName": "Wiegand",
                "email": "Frederic.Kertzmann26@yahoo.com",
                "phone": "151.072.4170",
                "studentData": "5b99757623f82f62586e9369",
                "__v": 0
            },
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
                    "extraPlayingTime": "et et voluptatum",
                    "mentorGrantedPlayingTime": "one quarter",
                    "studentActionItems": "a neque voluptatibus",
                    "sportsUpdate": "sequi dicta assumenda",
                    "additionalComments": "facilis laboriosam illum"
                },
                "_id": "5b99757623f82f62586e9361",
                "date": "2018-09-12T20:22:14.047Z",
                "student": {
                    "active": true,
                    "role": "student",
                    "students": [],
                    "_id": "5b99757523f82f62586e933a",
                    "firstName": "Edwin",
                    "lastName": "Wiegand",
                    "email": "Frederic.Kertzmann26@yahoo.com",
                    "phone": "151.072.4170",
                    "studentData": "5b99757623f82f62586e9369",
                    "__v": 0
                },
                "mentor": {
                    "active": true,
                    "role": "mentor",
                    "students": [],
                    "_id": "5b99757523f82f62586e9339",
                    "firstName": "Delphia",
                    "lastName": "Welch",
                    "email": "Porter.Schumm36@yahoo.com",
                    "phone": "320.836.5713",
                    "__v": 0
                },
                "mentorIsSubstitute": false,
                "subjects": [
                    {
                        "scoring": {
                            "excusedDays": 1,
                            "stamps": 2,
                            "halfStamp": 3,
                            "tutorials": 2
                        },
                        "_id": "5b99757623f82f62586e9368",
                        "subjectName": "Joy",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757523f82f62586e9342",
                            "firstName": "Hayley",
                            "lastName": "Ward",
                            "email": "Titus33@yahoo.com",
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
                        "_id": "5b99757623f82f62586e9367",
                        "subjectName": "Kaden",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757523f82f62586e9347",
                            "firstName": "Brayan",
                            "lastName": "Donnelly",
                            "email": "Maximus15@hotmail.com",
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
                        "_id": "5b99757623f82f62586e9366",
                        "subjectName": "Isobel",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757523f82f62586e934c",
                            "firstName": "August",
                            "lastName": "Schaden",
                            "email": "Lupe_Parisian@yahoo.com",
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
                        "_id": "5b99757623f82f62586e9365",
                        "subjectName": "Angelita",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757523f82f62586e9351",
                            "firstName": "Leif",
                            "lastName": "Marvin",
                            "email": "Hertha.Lynch4@yahoo.com",
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
                        "_id": "5b99757623f82f62586e9364",
                        "subjectName": "Savannah",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757523f82f62586e9356",
                            "firstName": "Myra",
                            "lastName": "Kris",
                            "email": "Myrna.McClure38@hotmail.com",
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
                        "_id": "5b99757623f82f62586e9363",
                        "subjectName": "Samanta",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757623f82f62586e935b",
                            "firstName": "Adrianna",
                            "lastName": "Toy",
                            "email": "Barbara.Rutherford@gmail.com",
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
                        "_id": "5b99757623f82f62586e9362",
                        "subjectName": "Elisa",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b99757623f82f62586e9360",
                            "firstName": "Lucious",
                            "lastName": "Gusikowski",
                            "email": "Julie_Doyle84@yahoo.com",
                            "__v": 0
                        },
                        "grade": 90
                    }
                ],
                "createdAt": "2018-09-12T20:22:14.073Z",
                "updatedAt": "2018-09-12T20:22:14.073Z",
                "__v": 0
            },
            "coaches": [
                {
                    "_id": "5b99757623f82f62586e936a",
                    "coach": {
                        "active": true,
                        "role": "coach",
                        "students": [],
                        "_id": "5b99757523f82f62586e933b",
                        "firstName": "Timmothy",
                        "lastName": "Schuppe",
                        "email": "Rosetta_Lehner@gmail.com",
                        "phone": "354.679.9907",
                        "__v": 0
                    },
                    "currentCoach": true
                }
            ],
            "sports": [
                {
                    "_id": "5b99757623f82f62586e936b",
                    "sportName": "baseball",
                    "team": "Mariners",
                    "league": "Bellevue Parks",
                    "currentlyPlaying": true
                }
            ],
            "mentors": [
                {
                    "_id": "5b99757623f82f62586e936c",
                    "mentor": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b99757523f82f62586e9339",
                        "firstName": "Delphia",
                        "lastName": "Welch",
                        "email": "Porter.Schumm36@yahoo.com",
                        "phone": "320.836.5713",
                        "__v": 0
                    },
                    "currentMentor": true
                }
            ],
            "teachers": [
                {
                    "_id": "5b99757623f82f62586e9373",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757523f82f62586e9342",
                        "firstName": "Hayley",
                        "lastName": "Ward",
                        "email": "Titus33@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e9372",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757523f82f62586e9347",
                        "firstName": "Brayan",
                        "lastName": "Donnelly",
                        "email": "Maximus15@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e9371",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757523f82f62586e934c",
                        "firstName": "August",
                        "lastName": "Schaden",
                        "email": "Lupe_Parisian@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e9370",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757523f82f62586e9351",
                        "firstName": "Leif",
                        "lastName": "Marvin",
                        "email": "Hertha.Lynch4@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e936f",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757523f82f62586e9356",
                        "firstName": "Myra",
                        "lastName": "Kris",
                        "email": "Myrna.McClure38@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e936e",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757623f82f62586e935b",
                        "firstName": "Adrianna",
                        "lastName": "Toy",
                        "email": "Barbara.Rutherford@gmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b99757623f82f62586e936d",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b99757623f82f62586e9360",
                        "firstName": "Lucious",
                        "lastName": "Gusikowski",
                        "email": "Julie_Doyle84@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                }
            ],
            "family": [
                {
                    "_id": "5b99757623f82f62586e9375",
                    "member": {
                        "active": true,
                        "role": "admin",
                        "students": [],
                        "_id": "5b99757523f82f62586e933c",
                        "firstName": "Bernita",
                        "lastName": "Heller",
                        "email": "Adell_Considine61@gmail.com",
                        "phone": "327.097.8900",
                        "__v": 0
                    },
                    "weekdayGuardian": true,
                    "weekendGuardian": false
                },
                {
                    "_id": "5b99757623f82f62586e9374",
                    "member": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b99757523f82f62586e9339",
                        "firstName": "Delphia",
                        "lastName": "Welch",
                        "email": "Porter.Schumm36@yahoo.com",
                        "phone": "320.836.5713",
                        "__v": 0
                    },
                    "weekdayGuardian": false,
                    "weekendGuardian": true
                }
            ],
            "gender": "male",
            "school": [
                {
                    "_id": "5b99757623f82f62586e9376",
                    "schoolName": "Odle Middle School",
                    "currentSchool": true
                }
            ],
            "dateOfBirth": "2007-09-11T00:00:00.000Z",
            "grade": 7,
            "synopsisReportArchiveUrl": "http://www.google.com",
            "googleCalendarUrl": "http://www.google.com",
            "googleDocsUrl": "http://www.google.com",
            "__v": 0
        }
    ]
```

### Student Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c7
```
    {
        "active": true,
        "role": "student",
        "students": [],
        "_id": "5b9972d076be925ea26d8acb",
        "firstName": "Nico",
        "lastName": "Gottlieb",
        "email": "Kaci44@yahoo.com",
        "phone": "646.187.7425",
        "studentData": {
            "synergy": {
                "username": "SynergyUser",
                "password": "cGFzc3dvcmQ="
            },
            "_id": "5b9972d076be925ea26d8afa",
            "student": {
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b9972d076be925ea26d8acb",
                "firstName": "Nico",
                "lastName": "Gottlieb",
                "email": "Kaci44@yahoo.com",
                "phone": "646.187.7425",
                "studentData": "5b9972d076be925ea26d8afa",
                "__v": 0
            },
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
                    "extraPlayingTime": "facere cupiditate alias",
                    "mentorGrantedPlayingTime": "one quarter",
                    "studentActionItems": "beatae a voluptatibus",
                    "sportsUpdate": "officiis omnis fuga",
                    "additionalComments": "doloribus consequatur officiis"
                },
                "_id": "5b9972d076be925ea26d8af2",
                "date": "2018-09-12T20:10:56.334Z",
                "student": {
                    "active": true,
                    "role": "student",
                    "students": [],
                    "_id": "5b9972d076be925ea26d8acb",
                    "firstName": "Nico",
                    "lastName": "Gottlieb",
                    "email": "Kaci44@yahoo.com",
                    "phone": "646.187.7425",
                    "studentData": "5b9972d076be925ea26d8afa",
                    "__v": 0
                },
                "mentor": {
                    "active": true,
                    "role": "mentor",
                    "students": [],
                    "_id": "5b9972d076be925ea26d8aca",
                    "firstName": "Dave",
                    "lastName": "Watsica",
                    "email": "Esta_Ferry14@yahoo.com",
                    "phone": "724.121.4665",
                    "__v": 0
                },
                "mentorIsSubstitute": false,
                "subjects": [
                    {
                        "scoring": {
                            "excusedDays": 1,
                            "stamps": 2,
                            "halfStamp": 3,
                            "tutorials": 2
                        },
                        "_id": "5b9972d076be925ea26d8af9",
                        "subjectName": "Clotilde",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8ad3",
                            "firstName": "Jarret",
                            "lastName": "Larkin",
                            "email": "Kadin_Johnston@hotmail.com",
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
                        "_id": "5b9972d076be925ea26d8af8",
                        "subjectName": "Nicolas",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8ad8",
                            "firstName": "Albin",
                            "lastName": "Hackett",
                            "email": "Luz47@yahoo.com",
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
                        "_id": "5b9972d076be925ea26d8af7",
                        "subjectName": "Erich",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8add",
                            "firstName": "Ada",
                            "lastName": "Rosenbaum",
                            "email": "Rahul13@yahoo.com",
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
                        "_id": "5b9972d076be925ea26d8af6",
                        "subjectName": "Lurline",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8ae2",
                            "firstName": "Jett",
                            "lastName": "Bode",
                            "email": "Jalen_Schroeder35@yahoo.com",
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
                        "_id": "5b9972d076be925ea26d8af5",
                        "subjectName": "Alek",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8ae7",
                            "firstName": "Nyah",
                            "lastName": "Sauer",
                            "email": "Gonzalo70@gmail.com",
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
                        "_id": "5b9972d076be925ea26d8af4",
                        "subjectName": "Belle",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8aec",
                            "firstName": "Antonio",
                            "lastName": "Paucek",
                            "email": "Charlotte_Reynolds37@yahoo.com",
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
                        "_id": "5b9972d076be925ea26d8af3",
                        "subjectName": "Jameson",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9972d076be925ea26d8af1",
                            "firstName": "Marian",
                            "lastName": "Kreiger",
                            "email": "Rickie_Barton@gmail.com",
                            "__v": 0
                        },
                        "grade": 90
                    }
                ],
                "createdAt": "2018-09-12T20:10:56.361Z",
                "updatedAt": "2018-09-12T20:10:56.361Z",
                "__v": 0
            },
            "coaches": [
                {
                    "_id": "5b9972d076be925ea26d8afb",
                    "coach": {
                        "active": true,
                        "role": "coach",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8acc",
                        "firstName": "Abner",
                        "lastName": "Schroeder",
                        "email": "Gaetano_Hermann@hotmail.com",
                        "phone": "435.719.1274",
                        "__v": 0
                    },
                    "currentCoach": true
                }
            ],
            "sports": [
                {
                    "_id": "5b9972d076be925ea26d8afc",
                    "sportName": "baseball",
                    "team": "Mariners",
                    "league": "Bellevue Parks",
                    "currentlyPlaying": true
                }
            ],
            "mentors": [
                {
                    "_id": "5b9972d076be925ea26d8afd",
                    "mentor": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8aca",
                        "firstName": "Dave",
                        "lastName": "Watsica",
                        "email": "Esta_Ferry14@yahoo.com",
                        "phone": "724.121.4665",
                        "__v": 0
                    },
                    "currentMentor": true
                }
            ],
            "teachers": [
                {
                    "_id": "5b9972d076be925ea26d8b04",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8ad3",
                        "firstName": "Jarret",
                        "lastName": "Larkin",
                        "email": "Kadin_Johnston@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8b03",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8ad8",
                        "firstName": "Albin",
                        "lastName": "Hackett",
                        "email": "Luz47@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8b02",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8add",
                        "firstName": "Ada",
                        "lastName": "Rosenbaum",
                        "email": "Rahul13@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8b01",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8ae2",
                        "firstName": "Jett",
                        "lastName": "Bode",
                        "email": "Jalen_Schroeder35@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8b00",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8ae7",
                        "firstName": "Nyah",
                        "lastName": "Sauer",
                        "email": "Gonzalo70@gmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8aff",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8aec",
                        "firstName": "Antonio",
                        "lastName": "Paucek",
                        "email": "Charlotte_Reynolds37@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9972d076be925ea26d8afe",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8af1",
                        "firstName": "Marian",
                        "lastName": "Kreiger",
                        "email": "Rickie_Barton@gmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                }
            ],
            "family": [
                {
                    "_id": "5b9972d076be925ea26d8b06",
                    "member": {
                        "active": true,
                        "role": "admin",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8acd",
                        "firstName": "Mozell",
                        "lastName": "Mosciski",
                        "email": "Samir38@yahoo.com",
                        "phone": "618.085.5628",
                        "__v": 0
                    },
                    "weekdayGuardian": true,
                    "weekendGuardian": false
                },
                {
                    "_id": "5b9972d076be925ea26d8b05",
                    "member": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b9972d076be925ea26d8aca",
                        "firstName": "Dave",
                        "lastName": "Watsica",
                        "email": "Esta_Ferry14@yahoo.com",
                        "phone": "724.121.4665",
                        "__v": 0
                    },
                    "weekdayGuardian": false,
                    "weekendGuardian": true
                }
            ],
            "gender": "male",
            "school": [
                {
                    "_id": "5b9972d076be925ea26d8b07",
                    "schoolName": "Odle Middle School",
                    "currentSchool": true
                }
            ],
            "dateOfBirth": "2007-09-11T00:00:00.000Z",
            "grade": 7,
            "synopsisReportArchiveUrl": "http://www.google.com",
            "googleCalendarUrl": "http://www.google.com",
            "googleDocsUrl": "http://www.google.com",
            "__v": 0
        },
        "__v": 0
    }
```

### Mentor (or any adult role) Profile: GET /api/v1/profiles?id=5b75bbdd2d60007306e782c8
```
    {
        "active": true,
        "role": "mentor",
        "students": [
            {
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b99740c849c285fdc8aa2e8",
                "firstName": "Melvina",
                "lastName": "McCullough",
                "email": "Hallie41@yahoo.com",
                "phone": "311.772.1257",
                "studentData": {
                    "synergy": {
                        "username": "SynergyUser",
                        "password": "cGFzc3dvcmQ="
                    },
                    "_id": "5b99740c849c285fdc8aa317",
                    "student": {
                        "active": true,
                        "role": "student",
                        "students": [],
                        "_id": "5b99740c849c285fdc8aa2e8",
                        "firstName": "Melvina",
                        "lastName": "McCullough",
                        "email": "Hallie41@yahoo.com",
                        "phone": "311.772.1257",
                        "studentData": "5b99740c849c285fdc8aa317",
                        "__v": 0
                    },
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
                            "extraPlayingTime": "iusto praesentium rerum",
                            "mentorGrantedPlayingTime": "one quarter",
                            "studentActionItems": "consequuntur recusandae esse",
                            "sportsUpdate": "soluta neque sit",
                            "additionalComments": "occaecati autem nobis"
                        },
                        "_id": "5b99740c849c285fdc8aa30f",
                        "date": "2018-09-12T20:16:12.446Z",
                        "student": {
                            "active": true,
                            "role": "student",
                            "students": [],
                            "_id": "5b99740c849c285fdc8aa2e8",
                            "firstName": "Melvina",
                            "lastName": "McCullough",
                            "email": "Hallie41@yahoo.com",
                            "phone": "311.772.1257",
                            "studentData": "5b99740c849c285fdc8aa317",
                            "__v": 0
                        },
                        "mentor": {
                            "active": true,
                            "role": "mentor",
                            "students": [
                                "5b99740c849c285fdc8aa2e8"
                            ],
                            "_id": "5b99740c849c285fdc8aa2e7",
                            "firstName": "Vicky",
                            "lastName": "Greenholt",
                            "email": "Tevin81@hotmail.com",
                            "phone": "882.113.1008",
                            "__v": 0
                        },
                        "mentorIsSubstitute": false,
                        "subjects": [
                            {
                                "scoring": {
                                    "excusedDays": 1,
                                    "stamps": 2,
                                    "halfStamp": 3,
                                    "tutorials": 2
                                },
                                "_id": "5b99740c849c285fdc8aa316",
                                "subjectName": "Gianni",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa2f0",
                                    "firstName": "Lilliana",
                                    "lastName": "Runolfsdottir",
                                    "email": "Landen34@yahoo.com",
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
                                "_id": "5b99740c849c285fdc8aa315",
                                "subjectName": "Adolph",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa2f5",
                                    "firstName": "General",
                                    "lastName": "Pagac",
                                    "email": "Addison_Altenwerth71@gmail.com",
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
                                "_id": "5b99740c849c285fdc8aa314",
                                "subjectName": "Camden",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa2fa",
                                    "firstName": "Mercedes",
                                    "lastName": "Brown",
                                    "email": "Wilton_Mohr@yahoo.com",
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
                                "_id": "5b99740c849c285fdc8aa313",
                                "subjectName": "Maximo",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa2ff",
                                    "firstName": "Orin",
                                    "lastName": "Dicki",
                                    "email": "Olga.Russel@gmail.com",
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
                                "_id": "5b99740c849c285fdc8aa312",
                                "subjectName": "Melody",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa304",
                                    "firstName": "Earline",
                                    "lastName": "Ratke",
                                    "email": "Arlie.Dibbert39@hotmail.com",
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
                                "_id": "5b99740c849c285fdc8aa311",
                                "subjectName": "Crystel",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa309",
                                    "firstName": "Pietro",
                                    "lastName": "Wintheiser",
                                    "email": "Blake46@gmail.com",
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
                                "_id": "5b99740c849c285fdc8aa310",
                                "subjectName": "Malvina",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b99740c849c285fdc8aa30e",
                                    "firstName": "Zander",
                                    "lastName": "Bernier",
                                    "email": "Esteban.Nitzsche@hotmail.com",
                                    "__v": 0
                                },
                                "grade": 90
                            }
                        ],
                        "createdAt": "2018-09-12T20:16:12.475Z",
                        "updatedAt": "2018-09-12T20:16:12.475Z",
                        "__v": 0
                    },
                    "coaches": [
                        {
                            "_id": "5b99740c849c285fdc8aa318",
                            "coach": {
                                "active": true,
                                "role": "coach",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2e9",
                                "firstName": "Jaqueline",
                                "lastName": "Wisoky",
                                "email": "Hope_Cruickshank@hotmail.com",
                                "phone": "411.964.2714",
                                "__v": 0
                            },
                            "currentCoach": true
                        }
                    ],
                    "sports": [
                        {
                            "_id": "5b99740c849c285fdc8aa319",
                            "sportName": "baseball",
                            "team": "Mariners",
                            "league": "Bellevue Parks",
                            "currentlyPlaying": true
                        }
                    ],
                    "mentors": [
                        {
                            "_id": "5b99740c849c285fdc8aa31a",
                            "mentor": {
                                "active": true,
                                "role": "mentor",
                                "students": [
                                    "5b99740c849c285fdc8aa2e8"
                                ],
                                "_id": "5b99740c849c285fdc8aa2e7",
                                "firstName": "Vicky",
                                "lastName": "Greenholt",
                                "email": "Tevin81@hotmail.com",
                                "phone": "882.113.1008",
                                "__v": 0
                            },
                            "currentMentor": true
                        }
                    ],
                    "teachers": [
                        {
                            "_id": "5b99740c849c285fdc8aa321",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2f0",
                                "firstName": "Lilliana",
                                "lastName": "Runolfsdottir",
                                "email": "Landen34@yahoo.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa320",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2f5",
                                "firstName": "General",
                                "lastName": "Pagac",
                                "email": "Addison_Altenwerth71@gmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa31f",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2fa",
                                "firstName": "Mercedes",
                                "lastName": "Brown",
                                "email": "Wilton_Mohr@yahoo.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa31e",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2ff",
                                "firstName": "Orin",
                                "lastName": "Dicki",
                                "email": "Olga.Russel@gmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa31d",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa304",
                                "firstName": "Earline",
                                "lastName": "Ratke",
                                "email": "Arlie.Dibbert39@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa31c",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa309",
                                "firstName": "Pietro",
                                "lastName": "Wintheiser",
                                "email": "Blake46@gmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa31b",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa30e",
                                "firstName": "Zander",
                                "lastName": "Bernier",
                                "email": "Esteban.Nitzsche@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        }
                    ],
                    "family": [
                        {
                            "_id": "5b99740c849c285fdc8aa323",
                            "member": {
                                "active": true,
                                "role": "admin",
                                "students": [],
                                "_id": "5b99740c849c285fdc8aa2ea",
                                "firstName": "Karli",
                                "lastName": "Boyle",
                                "email": "Izaiah_Ziemann@gmail.com",
                                "phone": "795.621.5219",
                                "__v": 0
                            },
                            "weekdayGuardian": true,
                            "weekendGuardian": false
                        },
                        {
                            "_id": "5b99740c849c285fdc8aa322",
                            "member": {
                                "active": true,
                                "role": "mentor",
                                "students": [
                                    "5b99740c849c285fdc8aa2e8"
                                ],
                                "_id": "5b99740c849c285fdc8aa2e7",
                                "firstName": "Vicky",
                                "lastName": "Greenholt",
                                "email": "Tevin81@hotmail.com",
                                "phone": "882.113.1008",
                                "__v": 0
                            },
                            "weekdayGuardian": false,
                            "weekendGuardian": true
                        }
                    ],
                    "gender": "male",
                    "school": [
                        {
                            "_id": "5b99740c849c285fdc8aa324",
                            "schoolName": "Odle Middle School",
                            "currentSchool": true
                        }
                    ],
                    "dateOfBirth": "2007-09-11T00:00:00.000Z",
                    "grade": 7,
                    "synopsisReportArchiveUrl": "http://www.google.com",
                    "googleCalendarUrl": "http://www.google.com",
                    "googleDocsUrl": "http://www.google.com",
                    "__v": 0
                },
                "__v": 0
            }
        ],
        "_id": "5b99740c849c285fdc8aa2e7",
        "firstName": "Vicky",
        "lastName": "Greenholt",
        "email": "Tevin81@hotmail.com",
        "phone": "882.113.1008",
        "__v": 0
    }

```

