# Frontend

## Run locally

Use Node.js 22.5 or newer (the development API uses Node's built-in SQLite module):

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal, then use **Staff Login** in the header to view the staff dashboard. The prototype credentials are shown on the login page.

## Assessment storage

The Vite development server exposes `/api/sessions` and stores live assessment sessions in `frontend/.data/sessions.sqlite`. Vision answers are saved as the participant progresses; skills answers are saved after each response. The staff dashboard reads the same sessions and its advanced view displays the captured answers. Existing browser-local session records are imported into SQLite when the app connects.

The SQLite database is local to the machine running the development server. This prototype does not provide production authentication, encryption, or remote/cloud database hosting; do not use it to store real client information.
