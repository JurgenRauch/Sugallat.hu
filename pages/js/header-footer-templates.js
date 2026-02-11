// Header/Footer template strings live here so `main.js` doesn't ship/parse them
// unless a page truly needs runtime injection (legacy/missing placeholders).

export function buildHeaderHTML({
    isEnglish,
    urls,
    imagePath,
    logoPath,
}) {
    if (isEnglish) {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-logo">
                        <a href="${logoPath}" class="nav-logo-link">
                            <img src="${imagePath}" alt="Sugallat Ltd. Logo" class="logo">
                            <h2>Sugallat Ltd.</h2>
                        </a>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a href="${urls.homeUrl}" class="nav-link" data-nav="home">Home</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="${urls.servicesUrl}" class="nav-link" data-nav="services">Our Services</a>
                            <div class="dropdown-menu">
                                <a href="${urls.servicesUrl}#public-procurement" class="dropdown-link">Public Procurement</a>
                                <a href="${urls.servicesUrl}#project-management" class="dropdown-link">Project Management</a>
                                <a href="${urls.servicesUrl}#technical-design" class="dropdown-link">Technical Design</a>
                                <a href="${urls.servicesUrl}#environmental" class="dropdown-link">Environmental Management</a>
                            </div>
                        </li>
                        <li class="nav-item">
                            <a href="${urls.pricesUrl}" class="nav-link" data-nav="pricing">Pricing</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a href="#" class="nav-link" data-nav="more">More</a>
                            <div class="dropdown-menu">
                                <a href="${urls.contactUrl}" class="dropdown-link">Contact</a>
                                <a href="${urls.aboutUrl}" class="dropdown-link">About</a>
                                <a href="${urls.referencesUrl}" class="dropdown-link">Clients</a>
                                <a href="${urls.aboutUrl}#company-data" class="dropdown-link">Company Data</a>
                            </div>
                        </li>
                    </ul>
                    <div class="language-switcher">
                        <a href="#" class="lang-link" data-lang="hu" onclick="switchToLanguage('hu'); return false;">Magyar</a>
                        <span class="lang-separator">|</span>
                        <a href="#" class="lang-link active" data-lang="en" onclick="switchToLanguage('en'); return false;">English</a>
                    </div>
                    <div class="hamburger">
                        <span class="bar"></span>
                        <span class="bar"></span>
                        <span class="bar"></span>
                    </div>
                </div>
            </nav>
        `;
    }

    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="nav-logo">
                    <a href="${logoPath}" class="nav-logo-link">
                        <img src="${imagePath}" alt="Sugallat Kft. Logo" class="logo">
                        <h2>Sugallat Kft.</h2>
                    </a>
                </div>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="${urls.homeUrl}" class="nav-link" data-nav="home">Főoldal</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="${urls.tevekenysegeinkUrl}" class="nav-link" data-nav="services">Szolgáltatásaink</a>
                        <div class="dropdown-menu">
                            <a href="${urls.szorgKozbeszAjanlatkeroknekUrl}" class="dropdown-link">Közbeszerzés Ajánlatkérőknek</a>
                            <a href="${urls.szorgKozbeszAjanlattevoknekUrl}" class="dropdown-link">Közbeszerzés Ajánlattevőknek</a>
                            <a href="${urls.szorgJogorvoslatUrl}" class="dropdown-link">Jogorvoslat</a>
                            <a href="${urls.szorgPalyazatirasUrl}" class="dropdown-link">Pályázatírás</a>
                            <a href="${urls.szorgMuszakiTervezesUrl}" class="dropdown-link">Műszaki Tervezés</a>
                        </div>
                    </li>
                    <li class="nav-item">
                        <a href="${urls.arakUrl}" class="nav-link" data-nav="pricing">Áraink</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a href="${urls.bemutatkozasUrl}" class="nav-link" data-nav="more">Rólunk</a>
                        <div class="dropdown-menu">
                            <a href="${urls.kapcsolatUrl}" class="dropdown-link">Kapcsolat</a>
                            <a href="${urls.referenciakUrl}" class="dropdown-link">Ügyfeleink</a>
                        </div>
                    </li>
                </ul>
                <div class="language-switcher">
                    <a href="#" class="lang-link active" data-lang="hu" onclick="switchToLanguage('hu'); return false;">Magyar</a>
                    <span class="lang-separator">|</span>
                    <a href="#" class="lang-link" data-lang="en" onclick="switchToLanguage('en'); return false;">English</a>
                </div>
                <div class="hamburger">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </nav>
        
        <!-- Mobile Secondary Navigation -->
        <div class="mobile-secondary-nav" id="mobileSecondaryNav">
            <div class="mobile-nav-back" onclick="closeMobileSecondaryNav()">Vissza</div>
            <ul class="mobile-secondary-menu" id="mobileSecondaryMenu">
                <!-- Dynamic content will be inserted here -->
            </ul>
        </div>
    `;
}

export function buildFooterHTML({ urls }) {
    return `
        <!-- Footer -->
        <footer class="footer has-square-patterns">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Sugallat Kft.</h3>
                        <p>Szakmai szolgáltatások a legmagasabb színvonalon</p>
                    </div>
                    <div class="footer-section">
                        <h4>Szolgáltatásaink</h4>
                        <ul>
                            <li><a href="${urls.tevekenysegeinkUrl}">Összes szolgáltatás</a></li>
                            <li><a href="${urls.szorgKozbeszAjanlatkeroknekUrl}">Közbeszerzés ajánlatkérőknek</a></li>
                            <li><a href="${urls.szorgKozbeszAjanlattevoknekUrl}">Közbeszerzés ajánlattevőknek</a></li>
                            <li><a href="${urls.szorgJogorvoslatUrl}">Jogorvoslat</a></li>
                            <li><a href="${urls.szorgPalyazatirasUrl}">Pályázatírás</a></li>
                            <li><a href="${urls.szorgMuszakiTervezesUrl}">Műszaki tervezés</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Kapcsolat</h4>
                        <p>2461 Tárnok, Ősz u. 12.</p>
                        <p>Tel/fax: +36-23-333-853</p>
                        <p>Mobil: +36-20-424-5411</p>
                        <p>E-mail: <a href="mailto:benko@sugallat.hu">benko@sugallat.hu</a></p>
                    </div>
                    <div class="footer-section">
                        <h4>Hasznos linkek</h4>
                        <ul>
                            <li><a href="${urls.hasznoslinkekUrl}">Hasznos linkek</a></li>
                            <li><a href="${urls.referenciakUrl}">Referenciák</a></li>
                            <li><a href="${urls.rolunkUrl}">Rólunk</a></li>
                            <li><a href="${urls.blogUrl}">Blog</a></li>
                            <li><a href="${urls.adatkezelesiUrl}">Adatkezelési tájékoztató</a></li>
                            <li><a href="${urls.adatkezelesiUrl}#cookie-policy">Cookie szabályzat</a></li>
                            <li><a href="${urls.sitemapUrl}">Oldaltérkép</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Kövess minket</h4>
                        <div class="social-links">
                            <a href="https://www.facebook.com/sugallatkft/" target="_blank" class="social-link">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2025 Sugallat Kft. Minden jog fenntartva.</p>
                </div>
            </div>
        </footer>
    `;
}





