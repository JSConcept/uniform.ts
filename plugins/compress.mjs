//import path from 'path'
import { Buffer } from "node:buffer";
import { gzipSync } from 'fflate';

//
export default (options = {}) => {
	return {
		name: 'worker-compression',
		transform: (codeContent, id) => {
			const code = Buffer.from(codeContent, 'utf8');
            const gzip = Buffer.from(gzipSync(new Uint8Array(code), { level: 9 }));
            const b64c = gzip.toString('base64');

            //
			const map = { mappings: '' }
			return {
				code: `export default "${b64c}"`,
				map,
			}
		},
	}
}
