import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'RenovIm — Peinture, plâtrerie & rénovation en Suisse, depuis le canton de Vaud',description:'Un nouvel espace. Le même chez-vous. Près de 25 ans de métier et une organisation moderne pour vos travaux en Suisse, depuis le canton de Vaud.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr-CH"><body>{children}</body></html>}
