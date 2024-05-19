import puppeteer from "puppeteer";
const defaultTimeout = 600000; // 10 minutes
const protocolTimeout = 1200000; // 20 minutes

export const getMp3 = async (spotify_link) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      protocolTimeout,
    });
    const page = await browser.newPage();

    await page.goto(process.env.DOWNLOADER_URL, { timeout: defaultTimeout });

    await page.type("#url", spotify_link);
    await page.click("#send");

    const searchResultSelector = "#download-block";
    await page.waitForSelector(searchResultSelector, {
      timeout: defaultTimeout,
    });

    const mp3Link = await page.evaluate(() => {
      const downloadBlock = document.getElementById("download-block");
      const mp3Anchor = downloadBlock.querySelector(
        '.abuttons a[href*="type=mp3"]'
      );
      return mp3Anchor ? mp3Anchor.href : null;
    });

    await browser.close();
    return mp3Link;
  } catch (error) {
    console.error("Error getting documentUrl get_mp3_err:", error.message);
    return null;
  }
};

export const search_songs = async (query) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      protocolTimeout,
    });
    const page = await browser.newPage();

    console.log(process.env.QUERY_SONGS, query);
    await page.goto(`${process.env.QUERY_SONGS}/${query}`, {
      timeout: defaultTimeout,
    });

    await page.waitForSelector('[data-testid="tracklist-row"]', {
      timeout: defaultTimeout,
    });

    const titles = await page.$$eval(
      'button[aria-label*="Play"]',
      (buttons) => {
        return buttons
          .slice(1, 5)
          .map((button) => button.getAttribute("aria-label").slice(5));
      }
    );
    const links = await page.$$eval(
      '._iQpvk1c9OgRAc8KRTlH a[href*="track"]',
      (elems) => elems.map((el) => el.href)
    );

    await browser.close();
    return buildArray(links, titles);
  } catch (error) {
    console.error("Error getting songs list search_song_err:", error.message);
    return [];
  }
};

const buildArray = (links, titles) => {
  let arr = [];
  for (let i = 0; i < links.length; i++) {
    arr.push({ title: titles[i], link: links[i] });
  }
  return arr;
};
