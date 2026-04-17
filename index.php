<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <link rel="canonical" href="https://sugallat.hu/">
    <title>Sugallat Kft. - Átirányítás</title>
    <meta name="robots" content="noindex">
    <script>
        (function () {
            var redirectMap = {
                'bemutatkozas': '/bemutatkozas.html',
                'tevekenysegeink': '/tevekenysegeink/',
                'hasznos_linkek': '/hasznos-linkek.html',
                'elerhetoseg': '/kapcsolat.html',
                'referenciak': '/referenciak.html',
                'arak': '/arak.html',
                'munkatarsaink': '/bemutatkozas.html',
                'munkatarsaink_benko_istvan': '/bemutatkozas.html',
                'munkatarsaink_karpeta_anna': '/bemutatkozas.html',
                'munkatarsaink_szekely_anna_krisztina': '/bemutatkozas.html',
                'munkatarsaink_regi': '/bemutatkozas.html',
                'uzletpolitikank': '/bemutatkozas.html',
                'partner_cegek': '/bemutatkozas.html',
                'colleagues': '/bemutatkozas.html',
                'business_policy': '/bemutatkozas.html',
                'introduction': '/bemutatkozas.html',
                'letoltheto_dokumentumok': '/tevekenysegeink/',
                'activities': '/tevekenysegeink/',
                'Envecon': '/tevekenysegeink/',
                'Kozbeszerzesi_eljarasok_menete': '/tevekenysegeink/',
                'contacts': '/kapcsolat.html',
                'Answer': '/kapcsolat.html',
                'references': '/referenciak.html',
                'arak_regi': '/arak.html',
                'index_en': '/en/'
            };
            var f = new URLSearchParams(window.location.search).get('f');
            var target = (f && redirectMap[f]) ? redirectMap[f] : '/';
            window.location.replace(target);
        })();
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0; url=/">
    </noscript>
</head>
<body>
    <h1>Átirányítás...</h1>
    <p>Automatikusan átirányítjuk a <a href="/">főoldalra</a>.</p>
</body>
</html>
