<?php

namespace App\Infrastructure\Ui\Controller\Home;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class HomeController extends AbstractController
{
    #[Route('/profile', name: 'profile', host: '%main_host%')]
    #[IsGranted('ROLE_USER')]
    public function profile(): Response
    {
        return $this->render('home/index.html.twig');
    }

    #[Route('/{reactRouting}', name: 'home', requirements: ["reactRouting" => "^(?!login|register|logout|profile).*"], defaults: ['reactRouting' => null], priority: '-1')]
    public function index(): Response
    {
        return $this->render('home/index.html.twig');
    }
}
