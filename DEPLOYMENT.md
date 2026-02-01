# DEPLOYMENT

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB connection string
- [ ] Set strong `JWT_SECRET`
- [ ] Configure SMTP credentials
- [ ] Set `CORS_ORIGIN` to frontend domain
- [ ] Enable HTTPS on your host

## Build

```
cd client
npm install
npm run build
```

## Run Server

```
cd server
npm install
npm start
```

## Recommended Hosting

- API: Any Node.js host (VM, container, or PaaS)
- Frontend: Static hosting (CDN, storage static site, or reverse proxy)

## Environment Variables (Server)

```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
EMAIL_FROM=noreply@yourdomain.com
SMS_API_KEY=your_sms_key
CORS_ORIGIN=https://your-domain.com
```

### Server Not Responding

1. Check server status: `pm2 status`
2. View logs: `pm2 logs`
3. Restart: `pm2 restart all`
4. Check disk space: `df -h`
5. Check memory: `free -h`

### Database Connection Error

1. Verify MONGODB_URI
2. Check IP whitelist in MongoDB Atlas
3. Test connection: `mongosh "your-connection-string"`
4. Check firewall rules

### Email Not Sending

1. Verify SMTP credentials
2. Check SMTP_USER format (usually full email)
3. Verify app password for Gmail
4. Check logs for detailed error

### High Latency

1. Check database query performance
2. Enable caching
3. Check API response times
4. Optimize database indexes
5. Consider scaling infrastructure

---

## Scaling Strategy

### Stage 1: Monitor (First Month)
- Set up monitoring
- Watch metrics
- Identify bottlenecks

### Stage 2: Optimize (Months 2-3)
- Database indexing
- Caching layer
- API optimization
- Frontend optimization

### Stage 3: Scale (Month 4+)
- Multiple backend instances
- Load balancer
- Database replication
- CDN for frontend
- Separate services (queues, etc.)

---

## Support & Troubleshooting

**Common Issues:**
- Port in use → Change PORT in .env
- CORS errors → Update CORS_ORIGIN
- JWT errors → Check JWT_SECRET
- Email fails → Verify SMTP settings
- Database timeout → Check MongoDB connection

**Resources:**
- Heroku Docs: heroku.com/docs
- AWS Docs: aws.amazon.com/docs
- MongoDB Docs: mongodb.com/docs
- Node.js Docs: nodejs.org/docs

---

## Cost Estimation (Monthly)

**Heroku Free Tier:**
- Free dyno (limited)
- Free database (limited)

**Production Estimate:**
- Heroku Dyno: $25-50
- MongoDB Atlas M2: Free-$57
- Total: $50-100/month

**AWS:**
- EC2 t2.micro: ~$10
- RDS: $20-50
- Data transfer: ~$5
- Total: $35-65/month

**DigitalOcean:**
- Basic Droplet: $5-6
- Managed Database: $15-50
- Total: $20-56/month

---

## Maintenance Schedule

**Daily**
- Monitor error logs
- Check uptime
- Verify email delivery

**Weekly**
- Review performance metrics
- Check database size
- Test backups

**Monthly**
- Security updates
- Dependency updates
- Full backup verification

**Quarterly**
- Security audit
- Performance optimization
- Capacity planning

---

**Deployment Complete! 🚀**

Your Airline Agency Management System is now live and ready for production use.

Last Updated: January 2024
