
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // You missed this
const db = require('./db');
const cookie = require('cookie');
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

function handleStudentAPI(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const id = parsedUrl.pathname.split('/').pop();

  if (req.method === 'GET') {
    db.query('SELECT * FROM students', (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'DB Error' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      }
    });
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { name, email, course } = JSON.parse(body);
      db.query('INSERT INTO students (name, email, course) VALUES (?, ?, ?)', [name, email, course], (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Insert Error' }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Student added' }));
        }
      });
    });
  } else if (req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { name, email, course } = JSON.parse(body);
      db.query('UPDATE students SET name=?, email=?, course=? WHERE id=?', [name, email, course, id], (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Update Error' }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Student updated' }));
        }
      });
    });
  } else if (req.method === 'DELETE') {
    db.query('DELETE FROM students WHERE id=?', [id], (err) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Delete Error' }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Student deleted' }));
      }
    });
  }
}

function handleCourseAPI(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const id = parsedUrl.pathname.split('/').pop();

  if (req.method === 'GET' && parsedUrl.pathname === '/api/courses') {
    db.query('SELECT * FROM courses', (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database Error' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      }
    });
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/courses') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { title, description } = JSON.parse(body);
      db.query('INSERT INTO courses (title, description) VALUES (?, ?)', [title, description], (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Insert Error' }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Course added' }));
        }
      });
    });
  } else if (req.method === 'PUT' && parsedUrl.pathname.startsWith('/api/courses/')) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { title, description } = JSON.parse(body);
      db.query('UPDATE courses SET title=?, description=? WHERE id=?', [title, description, id], (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Update Error' }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({ message: 'Course updated' }));
        }
      });
    });
  } else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/api/courses/')) {
    db.query('DELETE FROM courses WHERE id=?', [id], (err) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Delete Error' }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Course deleted' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route Not Found' }));
  }
}
 // Required for parsing

// Faculty API handler
function handleFacultyAPI(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const id = parsedUrl.pathname.split('/').pop();

  // GET all faculty members
  if (req.method === 'GET' && parsedUrl.pathname === '/api/faculty') {
    db.query('SELECT * FROM faculty', (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Database Error' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      }
    });
  }

  // CREATE a faculty member
  else if (req.method === 'POST' && parsedUrl.pathname === '/api/faculty') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { name, email, department } = JSON.parse(body);
      db.query(
        'INSERT INTO faculty (name, email, department) VALUES (?, ?, ?)',
        [name, email, department],
        (err) => {
          if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Insert Error' }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Faculty added' }));
          }
        }
      );
    });
  }

  // UPDATE a faculty member
  else if (req.method === 'PUT' && parsedUrl.pathname.startsWith('/api/faculty/')) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { name, email, department } = JSON.parse(body);
      db.query(
        'UPDATE faculty SET name=?, email=?, department=? WHERE id=?',
        [name, email, department, id],
        (err) => {
          if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Update Error' }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Faculty updated' }));
          }
        }
      );
    });
  }

  // DELETE a faculty member
  else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/api/faculty/')) {
    db.query('DELETE FROM faculty WHERE id=?', [id], (err) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Delete Error' }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Faculty deleted' }));
      }
    });
  }

  // Invalid route
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route Not Found' }));
  }
}

// Handle authentication (login/signup)
function handleAuthAPI(req, res) {
  const parsedUrl = url.parse(req.url, true);

  // LOGIN
  if (req.method === 'POST' && parsedUrl.pathname === '/api/login') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { username, password } = JSON.parse(body);
      
      if (username === 'admin' && password === 'adminpassword') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.setHeader('Set-Cookie', cookie.serialize('role', 'admin', { httpOnly: true }));
        res.end(JSON.stringify({ message: 'Admin login successful', role: 'admin' }));
      } else {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
          if (err || results.length === 0) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Invalid username or password' }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.setHeader('Set-Cookie', cookie.serialize('role', 'user', { httpOnly: true }));
            res.end(JSON.stringify({ message: 'User login successful', role: 'user' }));
          }
        });
      }
    });
  }

  // SIGNUP
  else if (req.method === 'POST' && parsedUrl.pathname === '/api/signup') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { username, password, email } = JSON.parse(body);

      db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Error signing up user' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User signup successful' }));
        }
      });
    });
  }
}

// Login check middleware function
function checkLogin(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies.role;
}




const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
//  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
//     const userRole = checkLogin(req);
//     if (!userRole) {
//       res.writeHead(302, { Location: '/login.html' });
//       return res.end();
//     } else if (userRole === 'admin') {
//       res.writeHead(302, { Location: 'admin.html' });
//       return res.end();
//     } else if (userRole === 'user') {
//       res.writeHead(302, { Location: 'user.html' });
//       return res.end();
//     }
//   }

//   // Serve static files (login, signup, index, etc.)
//   if (req.method === 'GET' && req.url.startsWith('/')) {
//     let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
//     if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
//       serveStaticFile(res, filePath);
//     } else {
//       res.writeHead(404);
//       res.end('Not Found');
//     }
//   }



  // API routing
  if (pathname.startsWith('/api/students')) {
    handleStudentAPI(req, res);
  } else if (pathname.startsWith('/api/courses')) {
    handleCourseAPI(req, res);
  } 
  else if (req.url.startsWith('/api/faculty')) {
  handleFacultyAPI(req, res);
}
else if (pathname === '/api/login' && req.method === 'POST') {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    const { username, password } = JSON.parse(body);

    db.query('SELECT * FROM admin WHERE username=? AND password=?', [username, password], (err, results) => {
      if (err || results.length === 0) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid admin credentials' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Admin login successful' }));
      }
    });
  });
}
 


//   else if (req.url.startsWith('/api/login') || req.url.startsWith('/api/signup')) {
//     handleAuthAPI(req, res);
//   }
else {
  
    // Serve static files
    let filePath = path.join(__dirname, '../public', pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveStaticFile(res, filePath);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
