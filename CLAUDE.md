# ICTC-Asset (ระบบครุภัณฑ์ IT)

Next.js + Prisma + MySQL. **ผู้ใช้ยืนยันว่าโปรเจกต์นี้ทำโดยเด็กฝึกงานตามที่หัวหน้าสั่ง ไม่ผ่านการตรวจสอบจาก
admin ก่อน deploy จริง แต่ใช้งานจริงแล้วตอนนี้และมีข้อมูลจริงในระบบ** (2026-08-12) — ระวังเป็นพิเศษกับทุก action
ที่แตะฐานข้อมูลหรือไฟล์ที่ผู้ใช้ upload (`app_uploads` volume) ไม่แตะโดยไม่ถามก่อนเด็ดขาด

ไม่มี CLAUDE.md มาก่อน — ไฟล์นี้เริ่มจากผลตรวจสอบ 2026-08-12 (โปรเจกต์นี้ถูกตั้งข้อสังเกตไว้ตั้งแต่ต้นงานว่าเป็น
ความเสี่ยงสูงสุดในบรรดา 13 โปรเจกต์ เพราะเปิด phpMyAdmin สู่สาธารณะ — ตรวจแล้วยืนยันว่าเป็นจริง แก้ไปแล้ว)

## ⚠️⚠️ สิ่งที่เจอร้ายแรงที่สุดของการตรวจทั้งหมด — แก้แล้ว 2026-08-12

1. **`.env` ถูก commit อยู่ใน git ตั้งแต่ commit แรก ("Add files via upload") ไม่เคยถูก gitignore เลย** มีรหัสผ่าน
   จริงอยู่ข้างใน (`DB_ROOT_PASSWORD=nsn60000`, `DB_PASSWORD=nsn60000` — คล้ายรหัส `@Nsn60000` ที่เจอซ้ำใน
   plan/hsms มาก) — **แก้แล้ว**: `git rm --cached .env`, เพิ่ม `.env`/`.env.*` ใน `.gitignore` จริงๆ (เดิมมีแค่หัวข้อ
   comment ว่างเปล่า), สร้าง `.env.example` ใช้ placeholder แทน — **หมายเหตุ: ค่าเก่ายังอยู่ใน git history เดิม
   ถ้าต้องการล้างออกจริงต้อง rewrite history แยกต่างหาก (ยังไม่ได้ทำ)**
2. **phpMyAdmin เปิดสู่สาธารณะที่ `it-asset.nakhonsawanpao.go.th/phpmyadmin` โดยไม่มี auth ชั้นเพิ่มใดๆ นอกจาก
   login ของ phpMyAdmin เอง** — รวมกับข้อ 1 (รหัส DB หลุดใน git) คือความเสี่ยงสูงสุดที่เจอในการตรวจทั้งหมด เพราะไม่
   ต้องมี SSH/git access ก็ใช้ประโยชน์ได้ทันทีผ่านหน้าเว็บสาธารณะ — **แก้แล้วและยืนยันแล้ว**: ลบ service
   `phpmyadmin` ออกจาก `docker-compose.yml`, redeploy สำเร็จ, ทดสอบ `/phpmyadmin` จากภายนอกแล้วไม่ตอบสนองอีกต่อไป
   (ผู้ใช้ยืนยันว่าโปรเจกต์อื่นใช้ DBeaver ผ่าน SSH tunnel กันหมด อันนี้เป็นเคสเดียวที่เปิด phpMyAdmin ไว้ตามคำขอของ
   เด็กฝึกงาน ไม่ใช่มาตรฐานขององค์กร)
3. **รหัสผ่าน DB จริง (root x2 + app user) ถูกเปลี่ยนเป็นค่าใหม่ที่สุ่มแบบปลอดภัยแล้ว ทั้งใน Coolify env vars และ
   ในฐานข้อมูลที่รันอยู่จริง** (ตามคำขอผู้ใช้ "ตั้งใหม่ให้ secure ได้เลย") — รัน `ALTER USER` ตรงๆ กับ container
   ที่รันอยู่แล้ว (จำเป็นเพราะ `MYSQL_ROOT_PASSWORD`/`MYSQL_PASSWORD` มีผลแค่ตอนสร้างฐานข้อมูลครั้งแรกบน volume
   เปล่าเท่านั้น ไม่มีผลย้อนหลังกับ container ที่มีข้อมูลอยู่แล้ว) ยืนยันด้วยการทดสอบจริงว่ารหัสเก่าใช้ไม่ได้แล้วและ
   รหัสใหม่ใช้ได้

## Stack / Deploy

Next.js (multi-stage Dockerfile, non-root user `nextjs`, image ดีอยู่แล้ว) + Prisma + MySQL 8.0 — deploy บน
Coolify ผ่าน `docker-compose.yml` ฟังพอร์ต 3000 (`ports_exposes` ถูกต้องอยู่แล้ว ไม่ต้องแก้)

## สิ่งที่แก้เพิ่ม (มาตรฐานเดียวกับโปรเจกต์อื่น)

- เพิ่ม `HEALTHCHECK` ใน Dockerfile (ใช้ node's http module เอง เพราะ image `node:20-alpine` ไม่มี curl/wget
  ติดมา) — เปิด `health_check_enabled` ใน Coolify แล้ว
- `ports_exposes`/`.dockerignore` ตรวจแล้วถูกต้องอยู่ก่อนแล้ว ไม่ต้องแก้

## จุดที่ตรวจแล้วโอเค (ไม่ใช่ปัญหา)

- ระบบ auth มี `role` และ `status` (pending/active/suspended) จริง ไม่ใช่ "ใครล็อกอินได้ก็เป็นแอดมิน" แบบที่เจอใน
  khaoborkaew — สมัครสมาชิกใหม่ status เริ่มที่ `pending` ต้องได้รับอนุมัติก่อนถึงจะ login ผ่าน
- ไม่พบ hardcoded credential ในโค้ดแอป (ไม่มี seeder ที่ generate ผ่าน Prisma, `init-db.sql` เป็นแค่ comment
  เปล่าๆ ไม่มีอะไรจริง)
- `db`/เดิม `phpmyadmin` bind แค่ `127.0.0.1` ที่ระดับ Docker (ปัญหาจริงคือ Traefik proxy เข้าถึงผ่าน docker
  network อยู่ดี ไม่เกี่ยวกับ host port binding)

## ขั้นตอนที่ทำเสร็จแล้ว (2026-08-12)

1. ✅ รัน `ALTER USER` เปลี่ยนรหัสผ่านจริงในฐานข้อมูล (root x2 + inventory_user) เป็นค่าใหม่ที่สุ่มปลอดภัยแล้ว
   ยืนยันด้วยการ query จริงว่ารหัสเก่าใช้ไม่ได้แล้ว รหัสใหม่ใช้ได้
2. ✅ Redeploy สำเร็จ — docker-compose.yml เวอร์ชันไม่มี phpmyadmin มีผลจริงแล้ว
3. ✅ ลบ env vars ที่ไม่ได้ใช้ออกจาก Coolify: `GEMINI_API_KEY` (ไม่มีโค้ดเรียกใช้เลย, ค่ายังเป็น placeholder),
   `SERVICE_URL_PHPMYADMIN`/`SERVICE_FQDN_PHPMYADMIN` (ค้างจาก service ที่ลบไปแล้ว),
   `SERVICE_URL_NGINX`/`SERVICE_FQDN_NGINX` (ไม่มี service ชื่อ nginx ในระบบเลย)
4. ✅ ลบไฟล์ `nginx.conf` ที่ไม่ถูกอ้างอิงจากที่ไหนเลย (ของค้างจากดีไซน์เก่า)
5. ✅ อัปเดต `DEPLOY.md` ให้ตรงกับความเป็นจริง (ไม่มี Nginx/phpMyAdmin แล้ว แนะนำ DBeaver+SSH tunnel แทน)

## ⚠️ เหตุการณ์ระหว่างแก้ — เว็บล่มไปชั่วคราว (2026-08-12, แก้แล้ว)

Deploy ที่เพิ่ม `HEALTHCHECK` เข้าไปทำให้เว็บล่ม (503) ชั่วคราว เพราะ Next.js standalone server bind กับ
`$HOSTNAME` (Docker ตั้งเป็น container ID อัตโนมัติ) ไม่ใช่ `0.0.0.0` — healthcheck ที่เช็ค `127.0.0.1` เลยต่อไม่ติด
ทั้งที่แอปทำงานปกติดี ทำให้ Docker รายงาน unhealthy และ Traefik หยุด route ให้ **แก้แล้วด้วยการเพิ่ม
`ENV HOSTNAME="0.0.0.0"` ใน Dockerfile** (เป็น gotcha ที่รู้จักกันดีของ Next.js standalone + Docker) — ยืนยันแล้ว
ว่าเว็บกลับมาใช้งานได้ปกติ **ถ้าโปรเจกต์อื่นในอนาคตใช้ Next.js standalone deploy บน Docker ต้องเช็คจุดนี้ไว้ตั้งแต่
แรกเลย ไม่ต้องรอเจอปัญหาก่อน**

## Compose hardening เพิ่มเติม (2026-08-12)

`docker-compose.yml` เดิมมี `${VAR:-default}` แบบมี fallback ค่าอ่อนแออยู่ทุกจุด (`root_password`,
`inventory_password`, `your_nextauth_secret_here`) — ถ้า Coolify ไม่มีค่าจริงตั้งไว้จะ init ด้วยรหัสเดา-ได้-ง่าย
แบบเงียบๆ ทันที **ลบ fallback ออกหมดแล้ว** (Coolify มีค่าจริงตั้งไว้ครบอยู่แล้ว ไม่กระทบอะไร) — ถ้าวันไหนลืมตั้ง env
var จะ fail ทันทีแทนที่จะ silently ใช้รหัสอ่อนแอ

เพิ่ม `healthcheck` ให้ `db` และเปลี่ยน `app`'s `depends_on` เป็น `condition: service_healthy` (เดิมรอแค่ container
start ไม่รอ MySQL พร้อมรับ connection จริง) ตรงกับ pattern ของทุกโปรเจกต์อื่น — ปิดช่อง race condition ตอน
redeploy/restart สดๆ (โปรเจกต์นี้ไม่มี retry-connect logic ในโค้ดแอปเองด้วย ต่างจาก `plan` ที่มี)

## ขั้นตอนที่เหลือ (ต้องทำโดยผู้ใช้ หรือ ต้องยืนยันก่อน)

1. พิจารณาว่าจะ rewrite git history ลบ `.env` เก่าที่มีรหัสผ่านหลุดออกจากประวัติถาวรไหม (ตอนนี้รหัสถูกเปลี่ยนไปแล้ว
   ความเร่งด่วนลดลง แต่ยังเป็น hygiene ที่ควรทำ)
