(function configureAlfawordRuntime(global) {
  const localHost = global.location.hostname === '127.0.0.1' ||
    global.location.hostname === 'localhost';

  global.ALFA_API_BASE = global.ALFA_API_BASE || (
    localHost
      ? 'http://127.0.0.1:8787'
      : 'https://api.alfaword.games'
  );
  global.ALFA_ENABLE_SERVER_SESSIONS =
    global.ALFA_ENABLE_SERVER_SESSIONS ?? !localHost;
})(window);
