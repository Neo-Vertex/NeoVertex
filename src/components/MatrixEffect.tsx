import React, { useEffect, useRef } from 'react';

// Define as propriedades que o componente aceita (neste caso, a cor)
interface MatrixEffectProps {
    color: string; // A cor dos caracteres da matrix (ex: "#0F0", "#9D00FF")
}

const MatrixEffect: React.FC<MatrixEffectProps> = ({ color }) => {
    // Referência para o elemento canvas no DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Obtém o contexto 2D para desenhar
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Define o tamanho do canvas para cobrir a tela inteira
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Caracteres que serão usados na chuva de código
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
        const fontSize = 14;

        // Calcula quantas colunas cabem na largura da tela
        const columns = canvas.width / fontSize;

        // Array para controlar a posição vertical (Y) de cada gota(coluna)
        const drops: number[] = [];

        // Inicializa todas as gotas na posição 1 (topo da tela)
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        // Função de desenho principal que roda repetidamente
        const draw = () => {
            // Desenha um fundo preto quase transparente para criar o rastro (fade effect)
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Define a cor do texto (usando a cor passada via propriedade) e a fonte
            ctx.fillStyle = color;
            ctx.font = fontSize + "px monospace";

            // Loop por cada coluna para desenhar o caractere
            for (let i = 0; i < drops.length; i++) {
                // Escolhe um caractere aleatório
                const text = letters[Math.floor(Math.random() * letters.length)];

                // Desenha o caractere na posição correta (x = coluna, y = gota atual)
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Se a gota passou do fim da tela E um fator aleatório ocorrer,
                // manda a gota de volta para o topo (cria variação entre as colunas)
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                // Move a gota para baixo
                drops[i]++;
            }
        };

        // Executa a função 'draw' a cada 33ms (aproximadamente 30 frames por segundo)
        const interval = setInterval(draw, 33);

        // Função para ajustar o canvas se a janela for redimensionada
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Limpeza: remove o intervalo e o evento quando o componente for desmontado
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [color]); // Recria o efeito se a cor mudar

    // Renderiza o canvas fixo no fundo da tela, com baixa opacidade para não atrapalhar a leitura
    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.15, pointerEvents: 'none' }} />;
};

export default MatrixEffect;
