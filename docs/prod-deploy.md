# Production Deployment on Ubuntu 18

1. Install Docker:

   ```sh
   add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   apt-get update
   apt-cache policy docker-ce
   apt-get install -y docker-ce
   ```

2. Install Docker Compose:

   ```sh
   curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. Clone the mono repo:

   ```sh
   cd /home
   git clone https://gitlab.com/gutenbooks/gutenbooks
   ```

4. Make an environment variable file:

   ```sh
   cd gutenbooks
   cp .env.default .env
   ```

5. Change the environment variables in `.env` appropriately.

6. Install Certbot for HTTPS, and enter your information when prompted:

   ```sh
   apt-get install software-properties-common
   add-apt-repository universe
   apt-get update
   apt-get install certbot python3-certbot-nginx
   certbot certonly --standalone
   ```

7. Perform basic setup:

   ```sh
   docker-compose up -d
   docker-compose exec api npm run typeorm -- migration:run
   ```

8. Seed the books (takes a long time):

   ```sh
   docker-compose exec api npm run console -- seed all
   ```

9. Groups editions of the same book (takes a long time and requires a Goodreads API key):

   ```sh
   docker-compose exec api npm run console -- seed:goodreads all
   ```
