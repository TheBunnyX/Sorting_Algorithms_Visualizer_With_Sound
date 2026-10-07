# Sort With Sound Design

## Goal

สร้างเว็บ interactive sorting visualizer ที่ทำให้ผู้ใช้เห็นการทำงานของ 4 sorting algorithms พร้อมได้ยินเสียงที่สัมพันธ์กับค่าของแท่งกราฟและจังหวะการเปรียบเทียบ/สลับค่า โดยภาพรวมต้องมีความมืด เรียบ คอนทราสต์สูง และมี accent สีแดงตามภาพอ้างอิง

## Assumptions

- ผู้ใช้ต้องการเว็บสำหรับเรียนรู้/ทดลอง algorithm ไม่ใช่ระบบ backend หรือบัญชีผู้ใช้
- 4 algorithms คือ Bubble Sort, Selection Sort, Insertion Sort และ Quick Sort
- การสร้างเสียงใช้ Web Audio API ใน browser ไม่พึ่งไฟล์เสียงภายนอก
- รองรับ desktop และ mobile โดย interaction หลักต้องใช้งานได้ทั้ง mouse และ touch

## User Experience

หน้าเดียวแบ่งเป็น 3 บริเวณ:

1. Header แสดงชื่อ SORT WITH SOUND, คำอธิบายสั้น และปุ่มเริ่ม/หยุด
2. Visualization stage แสดงแท่งข้อมูลจำนวนปรับได้ โดยแท่ง active/comparing เป็นสีแดงหรือเฉดแดง ส่วนแท่งปกติเป็นขาว/เทาเข้ม
3. Control panel แสดง algorithm selector, จำนวนข้อมูล, speed, sound toggle, shuffle/reset และ status เช่น comparisons, swaps, elapsed time

เมื่อเริ่ม sort ผู้ใช้เห็น state เปลี่ยนทีละขั้น ไม่บล็อก browser UI และสามารถ pause, resume และ reset ได้ การเปลี่ยน algorithm หรือจำนวนข้อมูลระหว่างการ sort ต้องหยุด run เดิมก่อนสร้าง state ใหม่

## Functional Requirements

- สร้างข้อมูลสุ่มและ reset กลับไปยังข้อมูลที่ยังไม่เรียง
- รันทั้ง 4 algorithms บน array เดียวกันด้วย event stream ของ visualization steps
- แสดง active indices, sorted indices และ pivot/range สำหรับ Quick Sort เมื่อมี
- ปรับ speed ได้อย่างน้อย 3 ระดับ และควบคุม animation ผ่าน delay ที่คำนวณจาก speed
- สร้าง oscillator tone ต่อ step โดยความสูงเสียงสัมพันธ์กับค่าของแท่ง และปิดได้ด้วย sound toggle
- pause/resume ต้องรักษา state เดิม และ reset ต้องยกเลิก run ที่กำลังรออยู่
- ป้องกัน concurrent run ด้วย run token/cancellation guard
- เมื่อ sort เสร็จ แสดง completion state และสรุป metrics
- คีย์บอร์ดควบคุมปุ่มหลักได้ และสีต้องไม่เป็นตัวบอกสถานะเพียงอย่างเดียว

## Architecture

- Vite + React + TypeScript เป็น shell ของแอป
- `src/algorithms/` เป็น pure algorithm layer ที่รับ number[] และ yield/return `SortStep[]`; ไม่มี React หรือ Web Audio dependency
- `src/audio/` แยก audio scheduler ออกจาก visualization เพื่อให้ปิดเสียง/เปลี่ยน sound ได้โดยไม่แตะ algorithm
- `src/components/` แยก stage, controls และ metrics ออกจาก state orchestration
- `src/App.tsx` จัดการ session state, cancellation, timing และส่ง props ลง component
- CSS ใช้ custom properties, responsive grid และแท่งกราฟที่คำนวณจากข้อมูลจริง ไม่ใช้ภาพแทน visualization

## Error Handling and Accessibility

- ถ้า Web Audio ถูก block จนกว่าจะมี user gesture ให้แสดงสถานะว่าเสียงจะเริ่มเมื่อกด Start และยัง sort ต่อได้โดยไม่มีเสียง
- ปุ่มที่ไม่ควรใช้ระหว่าง running ต้อง disabled พร้อม `aria-label` ที่ชัดเจน
- stage มีข้อความสรุปสำหรับ screen reader เช่น algorithm, phase และจำนวน metrics ปัจจุบัน
- ขนาดแท่งขั้นต่ำและ control layout ต้องไม่ทำให้ข้อมูลล้นจอใน viewport กว้างแคบ

## Testing and Verification

- Unit tests ตรวจว่า algorithm ทั้ง 4 คืนค่าเรียงจากน้อยไปมาก, ไม่ทำข้อมูลสูญหาย และ emit step ที่นำไป replay ได้
- Component tests ตรวจ control state, pause/resume/reset และไม่เกิด concurrent run
- Build ต้องผ่าน TypeScript/Vite production build
- เปิด dev server และ HTTP-check หน้าเว็บจริงหลัง implement

## Out of Scope

- backend, authentication, database, leaderboard และการบันทึกผลข้าม session
- การเปรียบเทียบ benchmark ที่อ้างว่าแม่นยำระดับ production hardware
- การใช้ library animation/audio ขนาดใหญ่เมื่อ browser APIs เพียงพอ
