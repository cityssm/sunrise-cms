import path from 'node:path';
const _dirname = '.';
export const serviceConfig = {
    name: 'Sunrise CMS',
    description: 'Sunrise Cemetery Management System, a web-based application that allows cemetery managers to manage their cemetery records.',
    script: path.join(_dirname, 'index.js')
};
