<?php

namespace App\Controller;

use Fisharebest\Algorithm\Dijkstra;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AlgorithmController extends AbstractController
{
    #[Route('/dijkstra-symfony', name: 'dijkstra')]
    public function dijkstra(): Response
    {
        $graph = [
            'A' => ['B' => 9, 'D' => 14, 'F' => 7],
            'B' => ['A' => 9, 'C' => 11, 'D' => 2, 'F' => 10],
            'C' => ['B' => 11, 'E' => 6, 'F' => 15],
            'D' => ['A' => 14, 'B' => 2, 'E' => 9],
            'E' => ['C' => 6, 'D' => 9],
            'F' => ['A' => 7, 'B' => 10, 'C' => 15],
            'G' => [],
        ];

        $algorithm = new Dijkstra($graph);

        $path = $algorithm->shortestPaths('A', 'E');

        dd($path);
    }
}