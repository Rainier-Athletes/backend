# Rainier Athletes Backend API
[![Build Status](https://travis-ci.org/Rainier-Athletes/backend.svg?branch=master)](https://travis-ci.org/Rainier-Athletes/backend)

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
            "extraPlayingTime": "eius dolorum occaecati",
            "mentorGrantedPlayingTime": "one quarter",
            "studentActionItems": "ex blanditiis quaerat",
            "sportsUpdate": "voluptas incidunt aut",
            "additionalComments": "distinctio fugiat veniam"
        },
        "_id": "5b9c35b201c772a4e2c4c008",
        "date": "2018-09-14T22:26:58.349Z",
        "student": {
            "active": true,
            "role": "student",
            "students": [],
            "_id": "5b9c35b201c772a4e2c4bfe1",
            "firstName": "Lottie",
            "lastName": "Donnelly",
            "email": "Brando.Ankunding@yahoo.com",
            "phone": "876.163.0441",
            "studentData": "5b9c35b201c772a4e2c4c010",
            "__v": 0
        },
        "mentor": {
            "active": true,
            "role": "mentor",
            "students": [],
            "_id": "5b9c35b201c772a4e2c4bfe0",
            "firstName": "Francesca",
            "lastName": "Torphy",
            "email": "Sunny67@gmail.com",
            "phone": "876.612.4098",
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
                "_id": "5b9c35b201c772a4e2c4c00f",
                "subjectName": "Hanna",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4bfe9",
                    "firstName": "Carli",
                    "lastName": "Bechtelar",
                    "email": "Seth.Swift61@gmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c00e",
                "subjectName": "Adalberto",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4bfee",
                    "firstName": "Jabari",
                    "lastName": "Pacocha",
                    "email": "Brendan83@gmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c00d",
                "subjectName": "Janae",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4bff3",
                    "firstName": "Dolly",
                    "lastName": "Beatty",
                    "email": "Marie87@hotmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c00c",
                "subjectName": "Carol",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4bff8",
                    "firstName": "Tiffany",
                    "lastName": "Hane",
                    "email": "Rafaela36@hotmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c00b",
                "subjectName": "Agustin",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4bffd",
                    "firstName": "Jedidiah",
                    "lastName": "Schuster",
                    "email": "Myrl.Boehm62@hotmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c00a",
                "subjectName": "Russell",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4c002",
                    "firstName": "Rene",
                    "lastName": "King",
                    "email": "Jakob.Marquardt@hotmail.com",
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
                "_id": "5b9c35b201c772a4e2c4c009",
                "subjectName": "Jerrold",
                "teacher": {
                    "active": true,
                    "role": "teacher",
                    "students": [],
                    "_id": "5b9c35b201c772a4e2c4c007",
                    "firstName": "Madisen",
                    "lastName": "Bruen",
                    "email": "Franco.Hudson@gmail.com",
                    "__v": 0
                },
                "grade": 90
            }
        ],
        "createdAt": "2018-09-14T22:26:58.379Z",
        "updatedAt": "2018-09-14T22:26:58.379Z",
        "__v": 0
    }

```

### Student Data GET /api/v1/studentdata?id=5b99757623f82f62586e9369

Note that this route returns an array of results. This is because it can be queried by more than just id.
```
    [
        {
            "synergy": {
                "username": "SynergyUser",
                "password": "cGFzc3dvcmQ="
            },
            "_id": "5b9c35b301c772a4e2c4c08c",
            "student": {
                "active": true,
                "role": "student",
                "students": [],
                "_id": "5b9c35b301c772a4e2c4c05d",
                "firstName": "Stan",
                "lastName": "Lueilwitz",
                "email": "Jon.Satterfield19@gmail.com",
                "phone": "310.638.5934",
                "studentData": "5b9c35b301c772a4e2c4c08c",
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
                    "extraPlayingTime": "quis officiis officiis",
                    "mentorGrantedPlayingTime": "one quarter",
                    "studentActionItems": "voluptatibus eaque temporibus",
                    "sportsUpdate": "officia ipsum vitae",
                    "additionalComments": "eaque velit ullam"
                },
                "_id": "5b9c35b301c772a4e2c4c084",
                "date": "2018-09-14T22:26:59.230Z",
                "student": {
                    "active": true,
                    "role": "student",
                    "students": [],
                    "_id": "5b9c35b301c772a4e2c4c05d",
                    "firstName": "Stan",
                    "lastName": "Lueilwitz",
                    "email": "Jon.Satterfield19@gmail.com",
                    "phone": "310.638.5934",
                    "studentData": "5b9c35b301c772a4e2c4c08c",
                    "__v": 0
                },
                "mentor": {
                    "active": true,
                    "role": "mentor",
                    "students": [],
                    "_id": "5b9c35b301c772a4e2c4c05c",
                    "firstName": "Dangelo",
                    "lastName": "Bartell",
                    "email": "Destin.Harris16@yahoo.com",
                    "phone": "483.261.8711",
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
                        "_id": "5b9c35b301c772a4e2c4c08b",
                        "subjectName": "Kristoffer",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c065",
                            "firstName": "Dawn",
                            "lastName": "Goodwin",
                            "email": "Demario_Sanford22@gmail.com",
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
                        "_id": "5b9c35b301c772a4e2c4c08a",
                        "subjectName": "Jerrod",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c06a",
                            "firstName": "Americo",
                            "lastName": "Kunze",
                            "email": "Gunnar_King@hotmail.com",
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
                        "_id": "5b9c35b301c772a4e2c4c089",
                        "subjectName": "Alana",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c06f",
                            "firstName": "Mona",
                            "lastName": "Volkman",
                            "email": "Trycia85@hotmail.com",
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
                        "_id": "5b9c35b301c772a4e2c4c088",
                        "subjectName": "Alejandra",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c074",
                            "firstName": "Raymundo",
                            "lastName": "Shields",
                            "email": "Christop_Schmidt51@yahoo.com",
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
                        "_id": "5b9c35b301c772a4e2c4c087",
                        "subjectName": "Matilde",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c079",
                            "firstName": "Jonathon",
                            "lastName": "Orn",
                            "email": "Eryn.Lind@hotmail.com",
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
                        "_id": "5b9c35b301c772a4e2c4c086",
                        "subjectName": "Gino",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c07e",
                            "firstName": "Conrad",
                            "lastName": "Franecki",
                            "email": "Trenton_Goyette98@yahoo.com",
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
                        "_id": "5b9c35b301c772a4e2c4c085",
                        "subjectName": "Zackery",
                        "teacher": {
                            "active": true,
                            "role": "teacher",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c083",
                            "firstName": "Jany",
                            "lastName": "Breitenberg",
                            "email": "Dangelo.Zemlak22@gmail.com",
                            "__v": 0
                        },
                        "grade": 90
                    }
                ],
                "createdAt": "2018-09-14T22:26:59.250Z",
                "updatedAt": "2018-09-14T22:26:59.250Z",
                "__v": 0
            },
            "coaches": [
                {
                    "_id": "5b9c35b301c772a4e2c4c08d",
                    "coach": {
                        "active": true,
                        "role": "coach",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c05e",
                        "firstName": "Alberto",
                        "lastName": "Rosenbaum",
                        "email": "Pasquale.Price@yahoo.com",
                        "phone": "612.422.5661",
                        "__v": 0
                    },
                    "currentCoach": true
                }
            ],
            "sports": [
                {
                    "_id": "5b9c35b301c772a4e2c4c08e",
                    "sport": "baseball",
                    "team": "Mariners",
                    "league": "Bellevue Parks",
                    "currentlyPlaying": true
                }
            ],
            "mentors": [
                {
                    "_id": "5b9c35b301c772a4e2c4c08f",
                    "mentor": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c05c",
                        "firstName": "Dangelo",
                        "lastName": "Bartell",
                        "email": "Destin.Harris16@yahoo.com",
                        "phone": "483.261.8711",
                        "__v": 0
                    },
                    "currentMentor": true
                }
            ],
            "teachers": [
                {
                    "_id": "5b9c35b301c772a4e2c4c096",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c065",
                        "firstName": "Dawn",
                        "lastName": "Goodwin",
                        "email": "Demario_Sanford22@gmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c095",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c06a",
                        "firstName": "Americo",
                        "lastName": "Kunze",
                        "email": "Gunnar_King@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c094",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c06f",
                        "firstName": "Mona",
                        "lastName": "Volkman",
                        "email": "Trycia85@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c093",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c074",
                        "firstName": "Raymundo",
                        "lastName": "Shields",
                        "email": "Christop_Schmidt51@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c092",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c079",
                        "firstName": "Jonathon",
                        "lastName": "Orn",
                        "email": "Eryn.Lind@hotmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c091",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c07e",
                        "firstName": "Conrad",
                        "lastName": "Franecki",
                        "email": "Trenton_Goyette98@yahoo.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c090",
                    "teacher": {
                        "active": true,
                        "role": "teacher",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c083",
                        "firstName": "Jany",
                        "lastName": "Breitenberg",
                        "email": "Dangelo.Zemlak22@gmail.com",
                        "__v": 0
                    },
                    "currentTeacher": true
                }
            ],
            "family": [
                {
                    "_id": "5b9c35b301c772a4e2c4c098",
                    "member": {
                        "active": true,
                        "role": "admin",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c05f",
                        "firstName": "Hannah",
                        "lastName": "Beer",
                        "email": "Tyree.Treutel62@yahoo.com",
                        "phone": "835.595.8185",
                        "__v": 0
                    },
                    "weekdayGuardian": true,
                    "weekendGuardian": false
                },
                {
                    "_id": "5b9c35b301c772a4e2c4c097",
                    "member": {
                        "active": true,
                        "role": "mentor",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c05c",
                        "firstName": "Dangelo",
                        "lastName": "Bartell",
                        "email": "Destin.Harris16@yahoo.com",
                        "phone": "483.261.8711",
                        "__v": 0
                    },
                    "weekdayGuardian": false,
                    "weekendGuardian": true
                }
            ],
            "gender": "male",
            "school": [
                {
                    "_id": "5b9c35b301c772a4e2c4c099",
                    "schoolName": "Odle Middle School",
                    "currentSchool": true
                }
            ],
            "dateOfBirth": "2007-09-11T00:00:00.000Z",
            "grade": 7,
            "synopsisReportArchiveUrl": "http://www.google.com",
            "googleCalendarUrl": "http://www.google.com",
            "googleDocsUrl": "http://www.google.com",
            "createdAt": "2018-09-14T22:26:59.283Z",
            "updatedAt": "2018-09-14T22:26:59.283Z",
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
                "_id": "5b9c35b301c772a4e2c4c09b",
                "firstName": "Clarabelle",
                "lastName": "Lindgren",
                "email": "Kenneth.Abernathy6@yahoo.com",
                "phone": "973.743.8934",
                "studentData": {
                    "synergy": {
                        "username": "SynergyUser",
                        "password": "cGFzc3dvcmQ="
                    },
                    "_id": "5b9c35b301c772a4e2c4c0ca",
                    "student": {
                        "active": true,
                        "role": "student",
                        "students": [],
                        "_id": "5b9c35b301c772a4e2c4c09b",
                        "firstName": "Clarabelle",
                        "lastName": "Lindgren",
                        "email": "Kenneth.Abernathy6@yahoo.com",
                        "phone": "973.743.8934",
                        "studentData": "5b9c35b301c772a4e2c4c0ca",
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
                            "extraPlayingTime": "adipisci itaque odit",
                            "mentorGrantedPlayingTime": "one quarter",
                            "studentActionItems": "sunt aut aliquam",
                            "sportsUpdate": "voluptatum sed delectus",
                            "additionalComments": "recusandae eaque necessitatibus"
                        },
                        "_id": "5b9c35b301c772a4e2c4c0c2",
                        "date": "2018-09-14T22:26:59.613Z",
                        "student": {
                            "active": true,
                            "role": "student",
                            "students": [],
                            "_id": "5b9c35b301c772a4e2c4c09b",
                            "firstName": "Clarabelle",
                            "lastName": "Lindgren",
                            "email": "Kenneth.Abernathy6@yahoo.com",
                            "phone": "973.743.8934",
                            "studentData": "5b9c35b301c772a4e2c4c0ca",
                            "__v": 0
                        },
                        "mentor": {
                            "active": true,
                            "role": "mentor",
                            "students": [
                                "5b9c35b301c772a4e2c4c09b"
                            ],
                            "_id": "5b9c35b301c772a4e2c4c09a",
                            "firstName": "Stefan",
                            "lastName": "O'Reilly",
                            "email": "Nicole_Bode6@yahoo.com",
                            "phone": "276.396.3948",
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
                                "_id": "5b9c35b301c772a4e2c4c0c9",
                                "subjectName": "Ruthie",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0a3",
                                    "firstName": "Kiera",
                                    "lastName": "Mohr",
                                    "email": "Lora33@hotmail.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c8",
                                "subjectName": "Ardith",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0a8",
                                    "firstName": "Augustine",
                                    "lastName": "Mann",
                                    "email": "Catalina77@gmail.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c7",
                                "subjectName": "Kara",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0ad",
                                    "firstName": "Gladyce",
                                    "lastName": "Heidenreich",
                                    "email": "Toy_Upton63@yahoo.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c6",
                                "subjectName": "Ozella",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0b2",
                                    "firstName": "Paxton",
                                    "lastName": "Wolff",
                                    "email": "Keyshawn.Breitenberg@gmail.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c5",
                                "subjectName": "Douglas",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0b7",
                                    "firstName": "Nat",
                                    "lastName": "Jaskolski",
                                    "email": "Alta.Feil86@hotmail.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c4",
                                "subjectName": "Matilda",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0bc",
                                    "firstName": "Malika",
                                    "lastName": "O'Kon",
                                    "email": "Damion48@hotmail.com",
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
                                "_id": "5b9c35b301c772a4e2c4c0c3",
                                "subjectName": "Antonetta",
                                "teacher": {
                                    "active": true,
                                    "role": "teacher",
                                    "students": [],
                                    "_id": "5b9c35b301c772a4e2c4c0c1",
                                    "firstName": "Calista",
                                    "lastName": "Wolff",
                                    "email": "Rudy.Romaguera@hotmail.com",
                                    "__v": 0
                                },
                                "grade": 90
                            }
                        ],
                        "createdAt": "2018-09-14T22:26:59.633Z",
                        "updatedAt": "2018-09-14T22:26:59.633Z",
                        "__v": 0
                    },
                    "coaches": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0cb",
                            "coach": {
                                "active": true,
                                "role": "coach",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c09c",
                                "firstName": "Kenny",
                                "lastName": "Schuster",
                                "email": "Jaylon.Runolfsson@yahoo.com",
                                "phone": "543.468.6602",
                                "__v": 0
                            },
                            "currentCoach": true
                        }
                    ],
                    "sports": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0cc",
                            "sport": "baseball",
                            "team": "Mariners",
                            "league": "Bellevue Parks",
                            "currentlyPlaying": true
                        }
                    ],
                    "mentors": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0cd",
                            "mentor": {
                                "active": true,
                                "role": "mentor",
                                "students": [
                                    "5b9c35b301c772a4e2c4c09b"
                                ],
                                "_id": "5b9c35b301c772a4e2c4c09a",
                                "firstName": "Stefan",
                                "lastName": "O'Reilly",
                                "email": "Nicole_Bode6@yahoo.com",
                                "phone": "276.396.3948",
                                "__v": 0
                            },
                            "currentMentor": true
                        }
                    ],
                    "teachers": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d4",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0a3",
                                "firstName": "Kiera",
                                "lastName": "Mohr",
                                "email": "Lora33@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d3",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0a8",
                                "firstName": "Augustine",
                                "lastName": "Mann",
                                "email": "Catalina77@gmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d2",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0ad",
                                "firstName": "Gladyce",
                                "lastName": "Heidenreich",
                                "email": "Toy_Upton63@yahoo.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d1",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0b2",
                                "firstName": "Paxton",
                                "lastName": "Wolff",
                                "email": "Keyshawn.Breitenberg@gmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d0",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0b7",
                                "firstName": "Nat",
                                "lastName": "Jaskolski",
                                "email": "Alta.Feil86@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0cf",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0bc",
                                "firstName": "Malika",
                                "lastName": "O'Kon",
                                "email": "Damion48@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0ce",
                            "teacher": {
                                "active": true,
                                "role": "teacher",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c0c1",
                                "firstName": "Calista",
                                "lastName": "Wolff",
                                "email": "Rudy.Romaguera@hotmail.com",
                                "__v": 0
                            },
                            "currentTeacher": true
                        }
                    ],
                    "family": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d6",
                            "member": {
                                "active": true,
                                "role": "admin",
                                "students": [],
                                "_id": "5b9c35b301c772a4e2c4c09d",
                                "firstName": "Louisa",
                                "lastName": "Hettinger",
                                "email": "Ashton.Kuphal90@hotmail.com",
                                "phone": "794.700.8670",
                                "__v": 0
                            },
                            "weekdayGuardian": true,
                            "weekendGuardian": false
                        },
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d5",
                            "member": {
                                "active": true,
                                "role": "mentor",
                                "students": [
                                    "5b9c35b301c772a4e2c4c09b"
                                ],
                                "_id": "5b9c35b301c772a4e2c4c09a",
                                "firstName": "Stefan",
                                "lastName": "O'Reilly",
                                "email": "Nicole_Bode6@yahoo.com",
                                "phone": "276.396.3948",
                                "__v": 0
                            },
                            "weekdayGuardian": false,
                            "weekendGuardian": true
                        }
                    ],
                    "gender": "male",
                    "school": [
                        {
                            "_id": "5b9c35b301c772a4e2c4c0d7",
                            "schoolName": "Odle Middle School",
                            "currentSchool": true
                        }
                    ],
                    "dateOfBirth": "2007-09-11T00:00:00.000Z",
                    "grade": 7,
                    "synopsisReportArchiveUrl": "http://www.google.com",
                    "googleCalendarUrl": "http://www.google.com",
                    "googleDocsUrl": "http://www.google.com",
                    "createdAt": "2018-09-14T22:26:59.661Z",
                    "updatedAt": "2018-09-14T22:26:59.661Z",
                    "__v": 0
                },
                "__v": 0
            }
        ],
        "_id": "5b9c35b301c772a4e2c4c09a",
        "firstName": "Stefan",
        "lastName": "O'Reilly",
        "email": "Nicole_Bode6@yahoo.com",
        "phone": "276.396.3948",
        "__v": 0
    }

```

