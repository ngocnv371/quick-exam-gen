curl -L -X POST 'https://qvjvlkbbemnxpvnlzuli.supabase.co/functions/v1/exam-gen' \
  -H 'apikey: sb_publishable_key' \
  -H 'Content-Type: application/json' \
  --data '{ "quantity":2, "exam": "test: midterm junior grade 5. question 1: Jake come home and found a plate with 10 cookies in it. He ate half of the cookies. His brother come after him and ate 2 cookies. How many cookies are left on the plate? A. 3 B. 2 C. 5 D. 10" }'
