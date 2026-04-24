type NormalizeSafeHrefOptions = {
  allowInternal?: boolean;
  allowedProtocols?: string[];
  allowedHostnames?: string[];
};

const DEFAULT_ALLOWED_PROTOCOLS = ['https:'];
const MAP_ALLOWED_HOSTNAMES = ['google.com', 'naver.com', 'naver.me', 'kakao.com', 'kko.to'];

function hostnameMatches(hostname: string, allowedHostname: string) {
  return hostname === allowedHostname || hostname.endsWith(`.${allowedHostname}`);
}

export function normalizeSafeHref(
  value: FormDataEntryValue | string | null | undefined,
  fallback: string,
  {
    allowInternal = true,
    allowedProtocols = DEFAULT_ALLOWED_PROTOCOLS,
    allowedHostnames,
  }: NormalizeSafeHrefOptions = {},
) {
  const href = String(value ?? '').trim();

  if (!href) {
    return fallback;
  }

  if (allowInternal && href.startsWith('/') && !href.startsWith('//')) {
    return href;
  }

  try {
    const url = new URL(href);

    if (!allowedProtocols.includes(url.protocol)) {
      return fallback;
    }

    if (
      allowedHostnames &&
      !allowedHostnames.some(allowedHostname => hostnameMatches(url.hostname, allowedHostname))
    ) {
      return fallback;
    }

    return url.toString();
  } catch {
    return fallback;
  }
}

export function normalizeSafeMapUrl(
  value: FormDataEntryValue | string | null | undefined,
  fallback: string,
) {
  return normalizeSafeHref(value, fallback, {
    allowInternal: false,
    allowedHostnames: MAP_ALLOWED_HOSTNAMES,
  });
}
