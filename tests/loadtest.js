import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/listings');

  if (res.status !== 200) {
    console.error(`Status: ${res.status}`);
  }

  sleep(1);
}