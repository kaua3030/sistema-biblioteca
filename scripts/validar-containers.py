"""Valida as imagens em docker-compose.validacao.yml, com banco descartavel."""

import json
import time
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API = "http://localhost:18000/api"
FRONTEND = "http://localhost:13000"


def request(path, method="GET", data=None, expected=200):
    payload = json.dumps(data).encode() if data is not None else None
    req = Request(API + path, data=payload, method=method,
                  headers={"Content-Type": "application/json"})
    try:
        response = urlopen(req, timeout=5)
    except HTTPError as error:
        response = error
    with response:
        assert response.status == expected, (method, path, response.status, expected)
        body = response.read()
        return json.loads(body) if body else None


for attempt in range(30):
    try:
        assert request("/health") == {"status": "ok"}
        break
    except (URLError, TimeoutError):
        if attempt == 29:
            raise
        time.sleep(1)
print("PASS: imagem do backend iniciou e respondeu ao health check")

with urlopen(FRONTEND, timeout=5) as response:
    html = response.read().decode()
    assert response.status == 200 and '<div id="root"></div>' in html
print("PASS: imagem do frontend serviu a aplicacao")

request("/livros", "POST", {"titulo": "", "autor": "Teste", "categoria": "Teste", "ano": 2026}, 400)
print("PASS: cadastro invalido recusado")

livro = request("/livros", "POST", {
    "titulo": "Validacao Docker", "autor": "Equipe Biblioteca",
    "categoria": "Teste", "ano": 2026
}, 201)
livro_id = livro["id"]
assert any(item["id"] == livro_id for item in request("/livros"))
print("PASS: cadastro e consulta persistidos no PostgreSQL")

emprestimo = request("/emprestimos", "POST", {
    "livroId": livro_id, "leitor": "Leitor de validacao",
    "dataPrevistaDevolucao": (datetime.now(timezone.utc) + timedelta(days=7)).date().isoformat()
}, 201)
request("/livros/" + str(livro_id), "DELETE", expected=409)
request("/emprestimos/" + str(emprestimo["id"]) + "/devolucao", "PATCH")
request("/livros/" + str(livro_id), "DELETE", expected=204)
print("PASS: emprestimo, bloqueio de exclusao, devolucao e exclusao apos devolucao")
