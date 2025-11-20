# Predictive-Lead-Scoring-Portal-for-Banking-Sales

## Arsiterktur FE dan BE
- untuk FE sendiri project kita bangun menggunakan React dan TS untuk menampilkan 3 halaman yaitu: Login, Dashboard, dan Detail dari si nasabah
- untuk BE kita pakai Hapi.js(node.js) buat nyediain API untuk login dan data(yang sementara kita taruh difolder BE page leads.js)

## Process state
- Untuk sementara BE kita sengaja kita pakai data tiruan dahulu(mock data)
- untuk data si usernya kita ambil langsung di folder BE/src/data/users.js dan untuk si nasabahnya di ../leads.js
- untuk proses ini kami(REBE) buat sementara karena gua(adjie) butuh buat skema ui untuk detail page-nya
- Model ML sudah selesai dilatih menggunakan beberapa algoritma:
1. Logistic Regression
2. Random Forest
3. Gradient Boosting
4. SVM (RBF)
Setelah evaluasi, model GradientBoostingClassifier menjadi kandidat terbaik (AUC tertinggi).
- preprocessing dan model sudah digabung menggunakan pipeline.
- model disimpan dalam format .pkl yang akan dijalankan menggunakan file python
- membuat file python untuk menjalankan model yang sudah disimpan, kemudian output modelnya disimpan dalam format .json untuk panggil backend (nodejs)
## Next step
- kita bakal mindahin data(bila sudah ready) dari file users.js dan leads.js ke DB-nya
- kita(REBE) refactor lagi BE nya,utamanya kita perbarui lagi tuh handler.js nya ke DB-nya(kalau implementasi DBnya sudah ready)
- nah kan sebelumnya gua(adjie) dah buat logic filter sama sortnya di FE(bersifat sementara dan mintol gemini soalnya gua gk tau caranya hehee)di file dashboard page tuh nah kalau sudah ada dari tim ML untuk logic filternya bisa kita pakai dan kita masukin di BE-nya(ini supaya FE-nya gk lemot aja)
- untuk API sekali lagi kita masih nunggu DB-nya sekalian karna setelah kita hubungin API dari BE dengan API dari ML buat ngambil skornya kan secara langsung dia nge-save ke databasenya

mohon koreksiannya bang abang sekalian tengkyu :)
