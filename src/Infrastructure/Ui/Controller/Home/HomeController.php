<?php

namespace App\Infrastructure\Ui\Controller\Home;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class HomeController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'home', requirements: ["reactRouting" => ".+"], defaults: ['reactRouting' => null], priority: '-1')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig');
    }
}
