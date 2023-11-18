import axios from 'axios';

const captchaNumber: { [key: string]: number } = {
    '34,34': 1,
    '108,108': 1,
    '42,41': 2,
    '116,116': 2,
    '104,110': 3,
    '30,36': 3,
    '30,40,41,34': 4,
    '104,114,115,107': 4,
    '31,37': 5,
    '105,111': 5,
    '33,33,35,35': 6,
    '107,107,109,109': 6,
    '37,45': 7,
    '111,119': 7,
    '34,33,33,36,35,36': 8,
    '108,108,107,110,109,109': 8,
    '34,40,42,36': 9,
    '108,114,116,110': 9
}

function extractPathSvg(svg: string): RegExpMatchArray | null {
    let noiseRegex = /^.*fill="none".*$/gm;
    let plusRegex = /^.*d="M72.*".*$/gm;
    let pathRegex = /<path.*>/gm;

    svg = svg.replace(/></mg, `>\n<`);

    return svg.replace(noiseRegex, '').replace(plusRegex, '').match(pathRegex);
}

function sumCaptcha(paths: RegExpMatchArray): number {
    let sum: number = 0;
    let positionRegex = /M\d+.\d+/gm;

    (paths as RegExpMatchArray).forEach(path => {
        let position: RegExpMatchArray | null = path.match(positionRegex);

        let numberPosition: number[] = (position as RegExpMatchArray).map((item: string) => {
            return Math.floor(Number(item.replace('M', '')));
        });

        Object.keys(captchaNumber).filter(item => {
            return item.length === numberPosition.join().length
        }).forEach(item => {
            let percent = 100;
            let lenPosition = numberPosition.length;
            let eachPercent = percent / lenPosition;

            let keys = item.split(',').map(item => Number(item));

            keys.forEach((item: number, index: number) => {
                if (item !== numberPosition[index])
                    percent = percent - eachPercent;
            })

            if (percent >= 50) {
                sum = sum + captchaNumber[item];
            }
        });
    });

    return sum;
}

function solveCaptcha(captcha:string){
    return sumCaptcha(extractPathSvg(captcha) as RegExpMatchArray);
}

axios.get('https://my.tci.ir/api/v1/captcha')
    .then(response => {
        let hash = response.data.hash;
        let captcha = response.data.captcha;

        axios.post('https://my.tci.ir/api/v1/bill/7733581408/guest',{
            captcha_code:String(solveCaptcha(captcha)),
            captcha_hash:hash
        }).then(response=>{
            console.log(response.data);
        })
    });